import { useEffect, useState } from "react";
import axiosInstance from "./api/axiosInstance";
import MenuItemRow from "./MenuItemRow";
import translations from "./i18n";
import "./App.css";
import AdminChangePassword from "./AdminChangePassword";

const categories = ["mains", "drinks", "breakfast", "snacks", "traditional"];
const defaultNewItem = {
  nameEn: "",
  nameAm: "",
  category: "mains",
  priceETB: "",
  descriptionEn: "",
  descriptionAm: "",
  isAvailable: true,
  isFasting: false,
  image: "",
  ingredientsEn: "",
  ingredientsAm: "",
  nutrition: {
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    fiber: "",
    servingSize: "",
  },
};

const AdminDashboard = ({ onLogout, lang = "en", setLang = () => {} }) => {
  const t = translations[lang] || translations.en;
  const [menuItems, setMenuItems] = useState([]);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [newItem, setNewItem] = useState(defaultNewItem);
  const [exchangeRate, setExchangeRate] = useState(150);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const adminToken = localStorage.getItem("adminToken");
  if (!adminToken) {
    // Keep UI simple; backend will reject admin calls.
  }

  const normalizeItem = (item) => {
    return {
      ...item,
      name: item.name || item.nameEn || "Untitled",
      category: item.category ? String(item.category).toLowerCase() : "mains",
      description: item.description || item.descEn || "",
    };
  };

  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/api/menu-items");
        const normalized = response.data.map(normalizeItem);
        setMenuItems(normalized);
      } catch (error) {
        console.error("Error fetching menu items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await axiosInstance.get("/api/exchange-rate");
        if (response.data?.exchangeRate) {
          setExchangeRate(response.data.exchangeRate);
        }
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
      }
    };

    fetchExchangeRate();
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  const updateMenuItem = async (id, updatedData, opts = {}) => {
    try {
      const isMultipart = !!opts.multipart;
      const response = await axiosInstance.patch(
        `/api/menu-items/${id}`,
        updatedData,
        {
          headers: isMultipart
            ? { "Content-Type": "multipart/form-data" }
            : undefined,
        },
      );

      // Ensure types match and update immediately using response payload.
      const updated = response.data;
      setMenuItems((prevItems) =>
        prevItems.map((item) =>
          Number(item.id) === Number(id) ? { ...item, ...updated } : item,
        ),
      );
      showToast("Item updated successfully.");
    } catch (error) {
      console.error("Error updating menu item:", error);
      showToast("Update failed. Please try again.");
    }
  };

  const createMenuItem = async (event) => {
    event.preventDefault();
    if (
      !newItem.nameEn.trim() ||
      !newItem.nameAm.trim() ||
      !newItem.category ||
      newItem.priceETB === ""
    ) {
      showToast("Name, category and price are required.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nameEn", newItem.nameEn.trim());
      formData.append("nameAm", newItem.nameAm.trim());
      formData.append("category", newItem.category);
      formData.append("priceETB", String(Number(newItem.priceETB)));
      formData.append("description", newItem.descriptionEn.trim());
      formData.append("descEn", newItem.descriptionEn.trim());
      formData.append("descAm", newItem.descriptionAm.trim());
      formData.append("isAvailable", String(!!newItem.isAvailable));
      formData.append("isFasting", String(!!newItem.isFasting));

      // multipart file upload (optional)
      if (newItem.imageFile) {
        formData.append("image", newItem.imageFile);
      }

      // arrays as JSON strings to keep it simple
      const ingredientsEn = newItem.ingredientsEn
        ? String(newItem.ingredientsEn)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
      const ingredientsAm = newItem.ingredientsAm
        ? String(newItem.ingredientsAm)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
      formData.append("ingredientsEn", JSON.stringify(ingredientsEn));
      formData.append("ingredientsAm", JSON.stringify(ingredientsAm));

      const nutrition = {
        calories: Number(newItem.nutrition.calories) || 0,
        protein: Number(newItem.nutrition.protein) || 0,
        carbs: Number(newItem.nutrition.carbs) || 0,
        fat: Number(newItem.nutrition.fat) || 0,
        fiber: Number(newItem.nutrition.fiber) || 0,
        servingSize: newItem.nutrition.servingSize || "",
      };
      formData.append("nutrition", JSON.stringify(nutrition));

      const response = await axiosInstance.post("/api/menu-items", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const created = response.data;
      setMenuItems((prev) => {
        // If backend returns same id (rare), replace instead of duplicating.
        const exists = prev.some((x) => Number(x.id) === Number(created.id));
        if (exists) {
          return prev.map((x) =>
            Number(x.id) === Number(created.id) ? created : x,
          );
        }
        return [...prev, created];
      });
      setNewItem(defaultNewItem);
      showToast("Menu item added.");
    } catch (error) {
      console.error("Error adding menu item:", error);
      showToast("Failed to add item.");
    }
  };

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // store the File object; we'll send it as multipart/form-data
    setNewItem((s) => ({ ...s, imageFile: file, image: "" }));
  };

  const updateAllItemUSDPrices = async () => {
    if (isNaN(exchangeRate) || exchangeRate <= 0) {
      showToast("Enter a valid exchange rate first.");
      return;
    }

    setBulkUpdating(true);
    try {
      const response = await axiosInstance.patch(
        "/api/menu-items",
        { exchangeRate },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
          },
        },
      );
      setMenuItems(response.data);
      showToast("All USD menu prices updated.");
    } catch (error) {
      console.error("Error updating all item prices:", error);
      showToast("Failed to update menu prices.");
    } finally {
      setBulkUpdating(false);
    }
  };

  const deleteMenuItem = async (id) => {
    if (!window.confirm("Delete this menu item?")) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/menu-items/${id}`);
      setMenuItems((prev) => prev.filter((item) => item.id !== id));
      showToast("Menu item deleted.");
    } catch (error) {
      console.error("Error deleting menu item:", error);
      showToast("Failed to delete item.");
    }
  };

  const filteredMenuItems = menuItems.filter((item) => {
    const term = searchQuery.toLowerCase();
    return (
      String(item.nameEn || item.name || "")
        .toLowerCase()
        .includes(term) ||
      String(item.nameAm || "")
        .toLowerCase()
        .includes(term) ||
      String(item.descEn || item.description || "")
        .toLowerCase()
        .includes(term) ||
      String(item.descAm || "")
        .toLowerCase()
        .includes(term) ||
      String(item.category).toLowerCase().includes(term) ||
      String(item.priceETB).includes(term)
    );
  });

  const groupedItems = filteredMenuItems.reduce((group, item) => {
    const category = item.category || "Uncategorized";
    group[category] = group[category] || [];
    group[category].push(item);
    return group;
  }, {});

  if (showChangePassword) {
    return (
      <AdminChangePassword
        lang={lang}
        onDone={() => setShowChangePassword(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t.adminDashboard}</h1>
            <p className="mt-2 text-sm text-slate-600">{t.manageText}</p>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex gap-1">
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1 rounded ${lang === "en" ? "bg-amber-500 text-white" : "bg-white text-slate-700 border"}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("am")}
                className={`px-3 py-1 rounded ${lang === "am" ? "bg-amber-500 text-white" : "bg-white text-slate-700 border"}`}
              >
                አማ
              </button>
            </div>
            <button
              onClick={() => setShowChangePassword(true)}
              className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
            >
              {t.ChangePassword}
            </button>
            <button
              onClick={onLogout}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              {t.logout}
            </button>
          </div>
        </div>

        {/* Dashboard Content Layout */}
        <div className="mt-6 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          {/* Main Content Area: Search and Menu Items Lists */}
          <section className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    {t.searchMenu}
                  </label>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500"
                  />
                </div>
                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
                  {t.totalItems}{" "}
                  <span className="font-semibold">
                    {filteredMenuItems.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {loading ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
                  Loading menu items...
                </div>
              ) : Object.keys(groupedItems).length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
                  No matching items found.
                </div>
              ) : (
                Object.entries(groupedItems).map(([category, items]) => (
                  <div
                    key={category}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">
                      {t[category] ||
                        (category
                          ? category.charAt(0).toUpperCase() + category.slice(1)
                          : "")}
                    </h2>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <MenuItemRow
                          key={item.id}
                          item={item}
                          onUpdate={updateMenuItem}
                          onDelete={deleteMenuItem}
                          lang={lang}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Sidebar Section: Forms and Adjustments */}
          <aside className="space-y-4">
            {/* Collapse Panel: Add New Item Form */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <details className="group">
                <summary className="cursor-pointer select-none list-none flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {t.addNew}
                  </h2>
                  <span className="text-2xl font-bold text-amber-600 group-open:rotate-180 transition-transform">
                    ▾
                  </span>
                </summary>

                <div className="mt-4">
                  <form onSubmit={createMenuItem} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        {t.nameEnLabel}
                        <input
                          value={newItem.nameEn}
                          onChange={(e) =>
                            setNewItem({ ...newItem, nameEn: e.target.value })
                          }
                          className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500"
                          placeholder="Example: Honey Toast"
                        />
                      </label>

                      <label className="block text-sm font-semibold text-slate-700">
                        {t.nameAmLabel}
                        <input
                          value={newItem.nameAm}
                          onChange={(e) =>
                            setNewItem({ ...newItem, nameAm: e.target.value })
                          }
                          className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500"
                          placeholder="ምሳሌ: ሃኒ ቶስት"
                        />
                      </label>

                      <label className="block text-sm font-semibold text-slate-700">
                        {t.category}
                        <select
                          value={newItem.category}
                          onChange={(e) =>
                            setNewItem({ ...newItem, category: e.target.value })
                          }
                          className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500"
                        >
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {t[category] ||
                                category.charAt(0).toUpperCase() +
                                  category.slice(1)}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block text-sm font-semibold text-slate-700">
                        {t.priceETB}
                        <input
                          value={newItem.priceETB}
                          onChange={(e) =>
                            setNewItem({ ...newItem, priceETB: e.target.value })
                          }
                          type="number"
                          min="0"
                          className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500"
                          placeholder="120"
                        />
                      </label>

                      <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                        {t.descriptionEnLabel}
                        <textarea
                          value={newItem.descriptionEn}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              descriptionEn: e.target.value,
                            })
                          }
                          className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500"
                          rows="3"
                          placeholder={t.optional}
                        />
                      </label>

                      <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                        {t.descriptionAmLabel}
                        <textarea
                          value={newItem.descriptionAm}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              descriptionAm: e.target.value,
                            })
                          }
                          className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500"
                          rows="3"
                          placeholder={t.optional}
                        />
                      </label>

                      <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                        {t.imageUpload}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFile}
                          className="mt-2 w-full text-sm text-slate-500 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500"
                        />
                        <input
                          type="text"
                          value={newItem.image}
                          onChange={(e) =>
                            setNewItem({ ...newItem, image: e.target.value })
                          }
                          placeholder={t.imageUrlPlaceholder}
                          className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500"
                        />
                        {newItem.image && (
                          <img
                            src={newItem.image}
                            alt="preview"
                            className="mt-2 h-24 w-auto rounded-md"
                          />
                        )}
                      </label>

                      <label className="block text-sm font-semibold text-slate-700">
                        {t.ingredientsEnLabel}
                        <input
                          type="text"
                          value={newItem.ingredientsEn}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              ingredientsEn: e.target.value,
                            })
                          }
                          className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                        />
                      </label>

                      <label className="block text-sm font-semibold text-slate-700">
                        {t.ingredientsAmLabel}
                        <input
                          type="text"
                          value={newItem.ingredientsAm}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              ingredientsAm: e.target.value,
                            })
                          }
                          className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="block text-sm font-semibold text-slate-700">
                        {t.calories}
                        <input
                          value={newItem.nutrition.calories}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              nutrition: {
                                ...newItem.nutrition,
                                calories: e.target.value,
                              },
                            })
                          }
                          type="number"
                          min="0"
                          className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                          placeholder="kcal"
                        />
                      </label>
                      <label className="block text-sm font-semibold text-slate-700">
                        {t.protein}
                        <input
                          value={newItem.nutrition.protein}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              nutrition: {
                                ...newItem.nutrition,
                                protein: e.target.value,
                              },
                            })
                          }
                          type="number"
                          min="0"
                          className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                          placeholder="g"
                        />
                      </label>
                      <label className="block text-sm font-semibold text-slate-700">
                        {t.carbs}
                        <input
                          value={newItem.nutrition.carbs}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              nutrition: {
                                ...newItem.nutrition,
                                carbs: e.target.value,
                              },
                            })
                          }
                          type="number"
                          min="0"
                          className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                          placeholder="g"
                        />
                      </label>
                      <label className="block text-sm font-semibold text-slate-700">
                        {t.fat}
                        <input
                          value={newItem.nutrition.fat}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              nutrition: {
                                ...newItem.nutrition,
                                fat: e.target.value,
                              },
                            })
                          }
                          type="number"
                          min="0"
                          className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                          placeholder="g"
                        />
                      </label>
                      <label className="block text-sm font-semibold text-slate-700">
                        {t.fiber}
                        <input
                          value={newItem.nutrition.fiber}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              nutrition: {
                                ...newItem.nutrition,
                                fiber: e.target.value,
                              },
                            })
                          }
                          type="number"
                          min="0"
                          className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                          placeholder="g"
                        />
                      </label>
                      <label className="block text-sm font-semibold text-slate-700">
                        {t.servingSize}
                        <input
                          value={newItem.nutrition.servingSize}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              nutrition: {
                                ...newItem.nutrition,
                                servingSize: e.target.value,
                              },
                            })
                          }
                          type="text"
                          className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                          placeholder="250ml"
                        />
                      </label>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={newItem.isAvailable}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              isAvailable: e.target.checked,
                            })
                          }
                          className="h-5 w-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                        />
                        {t.availableNow}
                      </label>

                      <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={newItem.isFasting}
                          onChange={(e) =>
                            setNewItem({
                              ...newItem,
                              isFasting: e.target.checked,
                            })
                          }
                          className="h-5 w-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                        />
                        {t.fastingItem}
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-600"
                    >
                      {t.createItem}
                    </button>
                  </form>
                </div>
              </details>
            </div>

            {/* Admin global settings container */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                Admin settings
              </h2>
              <div className="space-y-3 text-sm text-slate-700">
                <label className="block">
                  Exchange rate (ETB per USD)
                  <div className="mt-2 flex gap-2">
                    <input
                      type="number"
                      step="1"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(Number(e.target.value))}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                    />
                  </div>
                </label>
                <div className="pt-2">
                  <button
                    onClick={updateAllItemUSDPrices}
                    disabled={bulkUpdating}
                    className="w-full rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {bulkUpdating ? t.updatingAll : t.applyRate}
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Floating Status Notification Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-3xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
