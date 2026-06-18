const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const https = require("https");
const dotenv = require("dotenv");
const multer = require("multer");
const sharp = require("sharp");
const cloudinary = require("cloudinary").v2;

dotenv.config();

// Cloudinary config (only config if env vars exist)
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const app = express();

const DATA_PATH = path.join(__dirname, "data", "menu.json");
const CONFIG_PATH = path.join(__dirname, "data", "config.json");
const ADMIN_DATA_PATH = path.join(__dirname, "data", "admin.json");

const PORT = process.env.PORT || 4000;
const DEFAULT_EXCHANGE_RATE = 150;

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; // bootstrap when admin.json has no passwordHash

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Very small in-memory rate limit for public endpoints
const ipBuckets = new Map();
function rateLimit({ windowMs = 60_000, max = 20 } = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || "unknown";
    const now = Date.now();
    const bucket = ipBuckets.get(ip) || { start: now, count: 0 };
    if (now - bucket.start > windowMs) {
      bucket.start = now;
      bucket.count = 0;
    }
    bucket.count += 1;
    ipBuckets.set(ip, bucket);
    if (bucket.count > max)
      return res.status(429).json({ error: "Too many requests" });
    next();
  };
}

async function readConfig() {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return { exchangeRate: DEFAULT_EXCHANGE_RATE };
    throw err;
  }
}

async function writeConfig(config) {
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf8");
}

async function getCurrentExchangeRate() {
  const config = await readConfig();
  const rate = Number(config.exchangeRate);
  return !isNaN(rate) && rate > 0 ? rate : DEFAULT_EXCHANGE_RATE;
}

async function readData() {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  return JSON.parse(raw);
}

async function writeData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
}

async function readAdminData() {
  try {
    const raw = await fs.readFile(ADMIN_DATA_PATH, "utf8");
    return JSON.parse(raw || "{}") || {};
  } catch {
    return {};
  }
}

async function writeAdminData(data) {
  await fs.writeFile(ADMIN_DATA_PATH, JSON.stringify(data, null, 2), "utf8");
}

async function ensureAdminPasswordHashInitialized() {
  const adminData = await readAdminData();
  if (adminData.passwordHash && String(adminData.passwordHash).trim()) return;

  if (!ADMIN_PASSWORD) return;

  const passwordHash = bcrypt.hashSync(String(ADMIN_PASSWORD), 10);
  await writeAdminData({ ...(adminData || {}), passwordHash });
}

function requireAdminJwt(req, res, next) {
  if (!ADMIN_JWT_SECRET)
    return res.status(403).json({ error: "Admin auth not configured" });

  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ")
    ? auth.slice("Bearer ".length)
    : null;
  if (!token) return res.status(403).json({ error: "Admin access required" });

  try {
    const payload = jwt.verify(token, ADMIN_JWT_SECRET);
    if (!payload || payload.type !== "admin")
      return res.status(403).json({ error: "Admin access required" });
    req.admin = payload;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function sanitizeComment(comment) {
  const cleaned = String(comment || "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > 1000 ? cleaned.slice(0, 1000) : cleaned;
}

function sendTelegramMessage({ botToken, chatId, text }) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({ chat_id: String(chatId), text });

    const req = https.request(
      {
        hostname: "api.telegram.org",
        path: `/bot${botToken}/sendMessage`,
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData.toString()),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(body);
            if (parsed && parsed.ok) resolve(parsed);
            else reject(new Error(body));
          } catch (e) {
            reject(e);
          }
        });
      },
    );

    req.on("error", reject);
    req.write(postData.toString());
    req.end();
  });
}

// ---------- Cloudinary + multer + sharp (POST menu items) ----------
async function optimizeAndUploadToCloudinary(
  fileBuffer,
  { filename = "image" } = {},
) {
  if (!cloudinary?.config) {
    throw Object.assign(new Error("Cloudinary not configured"), {
      expose: true,
      status: 500,
    });
  }

  const optimizedBuffer = await sharp(fileBuffer)
    .rotate()
    // max width 600px, preserve aspect ratio, no enlargement
    .resize({ width: 600, withoutEnlargement: true })
    // compress + optimize
    .toFormat("webp", { quality: 82 })
    .toBuffer();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "digitalmenu",
        resource_type: "image",
        filename,
        transformation: [{ width: 600, crop: "scale" }],
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      },
    );
    uploadStream.end(optimizedBuffer);
  });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ---------- Routes ----------
app.get("/api/menu-items", async (req, res) => {
  try {
    const items = await readData();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to read menu items" });
  }
});

function toBool(v) {
  if (v === true || v === false) return v;
  const s = String(v ?? "")
    .toLowerCase()
    .trim();
  return s === "true" || s === "1" || s === "yes" || s === "on";
}

// PATCH update a menu item.
// Supports multipart/form-data for optional `image` upload + optimization.

app.patch("/api/menu-items/:id", upload.single("image"), async (req, res) => {
  const id = Number(req.params.id);

  const {
    nameEn,
    nameAm,
    category,
    description,
    descEn,
    descAm,
    priceETB,
    isAvailable,
    isFasting,
    image, // legacy string fallback from JSON
    nutrition,
    ingredientsEn,
    ingredientsAm,
  } = req.body;

  try {
    const items = await readData();
    const idx = items.findIndex((it) => it.id === id);
    if (idx === -1) return res.status(404).json({ error: "Item not found" });

    // Image
    if (req.file) {
      const result = await optimizeAndUploadToCloudinary(req.file.buffer, {
        filename: req.file.originalname,
      });
      items[idx].image = String(result?.secure_url || "");
    } else if (image !== undefined) {
      items[idx].image = String(image || "");
    }

    // Text fields
    if (nameEn !== undefined) {
      const cleanedName = String(nameEn).trim();
      items[idx].nameEn = cleanedName;
      items[idx].name = cleanedName;
    }
    if (nameAm !== undefined) items[idx].nameAm = String(nameAm).trim();
    if (category !== undefined) items[idx].category = String(category).trim();
    if (description !== undefined)
      items[idx].description = String(description).trim();

    if (descEn !== undefined) {
      items[idx].descEn = String(descEn).trim();
      if (items[idx].description === undefined || !items[idx].description) {
        items[idx].description = items[idx].descEn;
      }
    }
    if (descAm !== undefined) items[idx].descAm = String(descAm).trim();

    // Price
    if (priceETB !== undefined) {
      const num = Number(priceETB);
      if (isNaN(num) || num < 0)
        return res.status(400).json({ error: "Invalid price" });
      const exchangeRate = await getCurrentExchangeRate();
      items[idx].priceETB = num;
      items[idx].priceUSD = Math.round(num / exchangeRate);
    }

    // Booleans (FormData values are strings like "true"/"false")
    const toBool = (v) => {
      if (v === true || v === false) return v;
      const s = String(v).toLowerCase().trim();
      return s === "true" || s === "1" || s === "yes";
    };

    if (isAvailable !== undefined) items[idx].isAvailable = toBool(isAvailable);
    if (isFasting !== undefined) items[idx].isFasting = toBool(isFasting);

    // Ingredients + nutrition arrive as JSON strings in multipart mode
    if (ingredientsEn !== undefined) {
      const parsed =
        typeof ingredientsEn === "string"
          ? JSON.parse(ingredientsEn)
          : ingredientsEn;
      items[idx].ingredientsEn = Array.isArray(parsed)
        ? parsed.map((s) => String(s))
        : String(parsed)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }

    if (ingredientsAm !== undefined) {
      const parsed =
        typeof ingredientsAm === "string"
          ? JSON.parse(ingredientsAm)
          : ingredientsAm;
      items[idx].ingredientsAm = Array.isArray(parsed)
        ? parsed.map((s) => String(s))
        : String(parsed)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }

    if (nutrition !== undefined) {
      const parsed =
        typeof nutrition === "string" ? JSON.parse(nutrition) : nutrition;
      if (parsed && typeof parsed === "object") {
        items[idx].nutrition = {
          calories: Number(parsed.calories) || 0,
          protein: Number(parsed.protein) || 0,
          carbs: Number(parsed.carbs) || 0,
          fat: Number(parsed.fat) || 0,
          fiber: Number(parsed.fiber) || 0,
          servingSize: String(parsed.servingSize || "").trim(),
        };
      }
    }

    await writeData(items);
    return res.json(items[idx]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update item" });
  }
});

app.get("/api/exchange-rate", async (req, res) => {
  try {
    const exchangeRate = await getCurrentExchangeRate();
    res.json({ exchangeRate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to read exchange rate" });
  }
});

// Admin: update all item USD prices from an exchange rate
app.patch("/api/menu-items", requireAdminJwt, async (req, res) => {
  const exchangeRate = Number(req.body.exchangeRate);
  if (isNaN(exchangeRate) || exchangeRate <= 0)
    return res.status(400).json({ error: "Invalid exchange rate" });

  try {
    const items = await readData();
    const updatedItems = items.map((item) => ({
      ...item,
      priceUSD: Math.round(Number(item.priceETB) / exchangeRate),
    }));
    await writeData(updatedItems);
    await writeConfig({ exchangeRate });
    res.json(updatedItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update all menu prices" });
  }
});

// Feedback -> Telegram
app.post(
  "/api/feedback",
  rateLimit({ windowMs: 60_000, max: 15 }),
  async (req, res) => {
    try {
      if (!BOT_TOKEN || !CHAT_ID)
        return res.status(500).json({ error: "Telegram not configured" });

      const rating = Number(req.body?.rating);
      const comment = sanitizeComment(req.body?.comment);

      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res
          .status(400)
          .json({ error: "Rating must be an integer between 1 and 5" });
      }
      if (!comment || comment.length < 2)
        return res.status(400).json({ error: "Comment is required" });

      const text = `⭐ New Feedback\nRating: ${rating}/5\n\nComment: ${comment}`;
      await sendTelegramMessage({ botToken: BOT_TOKEN, chatId: CHAT_ID, text });
      return res.json({ ok: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to send feedback" });
    }
  },
);

// Admin auth endpoints
app.post("/api/admin/login", async (req, res) => {
  try {
    const password = String(req.body?.password || "");
    if (!password)
      return res.status(400).json({ error: "Password is required" });

    if (!ADMIN_JWT_SECRET)
      return res.status(500).json({ error: "Admin auth not configured" });

    await ensureAdminPasswordHashInitialized();

    const adminData = await readAdminData();
    const storedHash = adminData.passwordHash;
    if (!storedHash)
      return res.status(403).json({ error: "Admin password not initialized" });

    const ok = bcrypt.compareSync(password, storedHash);
    if (!ok) return res.status(403).json({ error: "Invalid credentials" });

    const token = jwt.sign({ type: "admin" }, ADMIN_JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/api/admin/change-password", requireAdminJwt, async (req, res) => {
  try {
    const currentPassword = String(req.body?.currentPassword || "");
    const newPassword = String(req.body?.newPassword || "");

    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: "Passwords are required" });
    if (newPassword.length < 8)
      return res
        .status(400)
        .json({ error: "New password must be at least 8 characters" });

    await ensureAdminPasswordHashInitialized();
    const adminData = await readAdminData();

    const storedHash = adminData.passwordHash;
    if (!storedHash)
      return res.status(403).json({ error: "Admin password not initialized" });

    const ok = bcrypt.compareSync(currentPassword, storedHash);
    if (!ok)
      return res.status(403).json({ error: "Current password is incorrect" });

    const newHash = bcrypt.hashSync(newPassword, 10);
    await writeAdminData({ ...(adminData || {}), passwordHash: newHash });

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to change password" });
  }
});

// POST create a new menu item (public). Upload image via multer + sharp + Cloudinary.
app.post("/api/menu-items", upload.single("image"), async (req, res) => {
  const {
    nameEn,
    nameAm,
    category,
    description,
    descEn,
    descAm,
    priceETB,
    isAvailable,
    image: imageFromBody, // optional legacy fallback
  } = req.body;

  // Multer file upload takes precedence
  let imageUrl = imageFromBody || "";
  if (req.file) {
    const result = await optimizeAndUploadToCloudinary(req.file.buffer, {
      filename: req.file.originalname,
    });
    imageUrl = result?.secure_url || "";
  }

  const cleanedNameEn = String(nameEn || "").trim();
  const cleanedNameAm = String(nameAm || "").trim();
  const cleanedCategory = String(category || "").trim();
  const priceNumber = Number(priceETB);

  if (
    !cleanedNameEn ||
    !cleanedNameAm ||
    !cleanedCategory ||
    isNaN(priceNumber) ||
    priceNumber < 0
  ) {
    return res
      .status(400)
      .json({ error: "Name, category and valid priceETB are required." });
  }

  try {
    const items = await readData();
    const nextId = items.length
      ? Math.max(...items.map((item) => item.id)) + 1
      : 1;
    const exchangeRate = await getCurrentExchangeRate();

    const newItem = {
      id: nextId,
      nameEn: cleanedNameEn,
      nameAm: cleanedNameAm,
      name: cleanedNameEn,
      category: cleanedCategory,
      description: String(description || descEn || "").trim(),
      descEn: String(descEn || description || "").trim(),
      descAm: String(descAm || "").trim(),
      priceETB: priceNumber,
      priceUSD: Math.round(priceNumber / exchangeRate),
      isAvailable: toBool(isAvailable),
      isFasting: toBool(req.body.isFasting),
      image: String(imageUrl || ""),
      ingredientsEn: req.body.ingredientsEn
        ? Array.isArray(req.body.ingredientsEn)
          ? req.body.ingredientsEn.map((s) => String(s))
          : String(req.body.ingredientsEn)
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
        : [],
      ingredientsAm: req.body.ingredientsAm
        ? Array.isArray(req.body.ingredientsAm)
          ? req.body.ingredientsAm.map((s) => String(s))
          : String(req.body.ingredientsAm)
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
        : [],
      nutrition: (() => {
        // FormData may send nutrition as JSON string.
        const raw = req.body?.nutrition;
        const parsed =
          typeof raw === "string"
            ? (() => {
                try {
                  return JSON.parse(raw);
                } catch {
                  return {};
                }
              })()
            : raw || {};

        return {
          calories: Number(parsed?.calories) || 0,
          protein: Number(parsed?.protein) || 0,
          carbs: Number(parsed?.carbs) || 0,
          fat: Number(parsed?.fat) || 0,
          fiber: Number(parsed?.fiber) || 0,
          servingSize: String(parsed?.servingSize || "").trim(),
        };
      })(),
    };

    items.push(newItem);
    await writeData(items);
    return res.status(201).json(newItem);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to add menu item" });
  }
});

// DELETE remove a menu item (public)
app.delete("/api/menu-items/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const items = await readData();
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length === items.length)
      return res.status(404).json({ error: "Item not found" });

    await writeData(filtered);
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete item" });
  }
});

ensureAdminPasswordHashInitialized().catch(() => {});

// Global error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  const status = Number(err?.statusCode || err?.status || 500);
  res.status(Number.isFinite(status) ? status : 500).json({
    error: err?.expose ? err.message : err?.message || "Internal Server Error",
  });
});

const server = app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

// Process-level stability listeners
function gracefulRestart(reason, err) {
  console.error("Server restarting due to:", reason);
  if (err) console.error(err);
  setTimeout(() => {
    process.exit(1);
  }, 1000);
}

process.on("uncaughtException", (err) =>
  gracefulRestart("uncaughtException", err),
);
process.on("unhandledRejection", (err) =>
  gracefulRestart("unhandledRejection", err),
);
