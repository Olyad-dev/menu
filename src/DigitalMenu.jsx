import { useEffect, useState } from "react";
import axiosInstance from "./api/axiosInstance";

import { toast } from "react-toastify";

// Restaurant Info
const RESTAURANT_INFO = {
  name: "Ethiopian Delights",
  nameAm: "ኢትዮጵያዊ ምግቦች",
  location: "Addis Ababa, Ethiopia",
  locationAm: "አዲስ አበባ, ኢትዮጵያ",
  phone: "+25191123456",
  tagline: "Authentic Ethiopian Cuisine",
  taglineAm: "ዋናው የኢትዮጵያ ምግብ",
};

export default function AdvancedDigitalMenu({ onAdminOpen }) {
  // Core App States
  const [lang, setLang] = useState("am"); // 'am' | 'en'
  const [currency, setCurrency] = useState("ETB"); // 'ETB' | 'USD'
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState("menu"); // 'menu' | 'home'
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [layoutMode, setLayoutMode] = useState("column"); // 'grid' | 'column'
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [cartViewOpen, setCartViewOpen] = useState(false);
  const [fastingFilter, setFastingFilter] = useState("all");
  // Feedback form (mobile sidebar)
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  // Dropdowns (mobile sidebar)
  const [paymentDropdownOpen, setPaymentDropdownOpen] = useState(false);
  const [socialDropdownOpen, setSocialDropdownOpen] = useState(false);
  // const [feedbackDropdownOpen, setFeedbackDropdownOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  const [selectedFood, setSelectedFood] = useState(null); // For food detail modal
  const [hideUnavailable, setHideUnavailable] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
  const EXCHANGE_RATE = 150;


  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        const response = await axiosInstance.get("/api/menu-items");

        if (Array.isArray(response.data) && response.data.length > 0) {
          const normalized = response.data.map((item) => ({
            ...item,
            priceETB: item.priceETB ?? item.price,
            priceUSD:
              item.priceUSD ??
              (item.priceETB
                ? Math.round(item.priceETB / EXCHANGE_RATE)
                : Math.round(item.price / EXCHANGE_RATE)),
          }));

          const final = normalized;

          setMenuItems(final);
        }
      } catch (error) {
        console.warn(
          "Unable to fetch backend menu items, using local fallback.",
          error,
        );
      }
    };

    loadMenuItems();
  }, []);

  // Language mapping helper
  const t = {
    am: {
      home: "ዋና ገጽ",
      menu: "የምግብ ዝርዝር",
      searchPlh: "በስም ወይም በዋጋ ይፈልጉ...",
      all: "ሁሉም",
      drinks: "መጠጦች",
      breakfast: "ቁርስ",
      snacks: "መክሰስ",
      traditional: "ባሕላዊ",
      payMethod: "የአከፋፈል አማራጮች",
      social: "ማህበራዊ ሚዲያ",
      feedback: "አስተያየት",
      total: "ጠቅላላ ሂሳብ",
      viewOrder: "ትዕዛዝ ለማየት",
      fasting: "የጾም",
      nonFasting: "የፍስክ",
      welcome: "እንኳን ደህና መጡ",
      address: "አድራሻ፡",
      add: "ደምር",
      cbe: "ሲቢኢ ብር",
      cbeAcc: "ቁጥር: 1000234567890",
      telebirr: "ቴሌብር",
      awash: "አዋሽ ባንክ",
      abyssinia: "አቢሲንያ ባንክ",
      telegram: "ቴሌግራም",
      instagram: "ኢንስታግራም",
      tiktok: "ቲክቶክ",
      rating: "ደረጃ",
      comment: "አስተያየት",
      write_your_feedback: "እዚህ አስተያየትዎን ይጻፉ...",
      gridLayout: "ሰፊ ዝርዝር",
      columnLayout: "ዓምድ ዝርዝር",
      darkMode: "ጨለማ",
      lightMode: "ብርሃን",
      cartEmpty: "ባዶ ነው",
      qty: "ብዛት",
      remove: "ማስወገድ",
      checkout: "መጨረስ",
      subtotal: "ከ ታክስ ዉጪ ጠቅላላ",
      clearCart: "ማጥፋት",
      ingredients: "ንጥረ ነገሮች",
      nutrition: "የአመጋገብ ዝርዝር",
      calories: "ካሎሪ",
      protein: "ፕሮቲን",
      carbs: "ካርቦሃይድሬት",
      fat: "ቅባት",
      fiber: "ተለዋጭ ሃይል",
      servingSize: "መጠን",
      addToCart: "+ ወደ ሂሳብ መጨምር",
      close: "መዝጊያ",
      adminButton: "አስተዳደር",
      adminOnlyNotice: "እባክዎን ይህ ለአስተዳደር ብቻ ነው።",
      successMessage: "አስተያየትዎ በተሳካ ሁኔታ ደርሷል!",
    },
    en: {
      home: "Home",
      menu: "Menu",
      searchPlh: "Search by name or price...",
      all: "All",
      drinks: "Drinks",
      breakfast: "Breakfast",
      snacks: "Snacks",
      traditional: "Traditional",
      payMethod: "Payment Methods",
      social: "Social Media",
      feedback: "Feedback",
      total: "Total Bill",
      viewOrder: "View Order",
      fasting: "Fasting",
      nonFasting: "Non-Fasting",
      welcome: "Welcome to " + RESTAURANT_INFO.name,
      address: "Address:",
      add: "Add",
      cbe: "CBE Birr",
      cbeAcc: "Account: 1000234567890",
      telebirr: "Telebirr",
      awash: "Awash Bank",
      abyssinia: "Abyssinia Bank",
      telegram: "Telegram",
      instagram: "Instagram",
      tiktok: "TikTok",
      rating: "Rating",
      comment: "Comment",
      write_your_feedback: "Write your feedback here...",
      gridLayout: "Grid Layout",
      columnLayout: "Column Layout",
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
      cartEmpty: "Cart is Empty",
      qty: "Quantity",
      remove: "Remove",
      checkout: "Checkout",
      subtotal: "Subtotal",
      clearCart: "Clear Cart",
      ingredients: "Ingredients",
      nutrition: "Nutrition Facts",
      calories: "Calories",
      protein: "Protein",
      carbs: "Carbs",
      fat: "Fat",
      fiber: "Fiber",
      servingSize: "Serving Size",
      addToCart: "+ Add to Cart",
      close: "Close",
      adminButton: "Admin",
      adminOnlyNotice: "Login is for admin use only.",
      successMessage: "Thanks for your feedback!",
    },
  }[lang];

  // Cart Functions
  const addToCart = (item) => {
    const exist = cart.find((x) => x.id === item.id);
    if (exist) {
      setCart(
        cart.map((x) =>
          x.id === item.id ? { ...exist, qty: exist.qty + 1 } : x,
        ),
      );
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((x) => x.id !== itemId));
  };

  const updateCartQty = (itemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map((x) => (x.id === itemId ? { ...x, qty: newQty } : x)));
    }
  };

  const clearCart = () => {
    setCart([]);
    setCartViewOpen(false);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = currency === "ETB" ? item.priceETB : item.priceUSD;
      return total + price * item.qty;
    }, 0);
  };

  // Advanced Search and Filter Logic
  const submitFeedback = async (e) => {
    e.preventDefault();
    setFeedbackSubmitting(true);
    setFeedbackError("");

      try {
        const payload = {
          rating: feedbackRating,
          comment: feedbackComment,
        };

        const res = await axiosInstance.post("/api/feedback", payload);

      if (res.data?.ok) {
        toast.success(t.successMessage || "አስተያየትዎ በተሳካ ሁኔታ ደርሷል!", {
          style: {
            backgroundColor: "#f59e0b",
            color: "#ffffff",
            borderRadius: "10px",
            fontFamily: "sans-serif",
            fontWeight: "600",
            padding: "8px 12px",
            width: "fit-content",
            margin: "0 auto",
          },
          progressStyle: {
            backgroundColor: "#ffff",
          },
        });
        setFeedbackOpen(false);
        setFeedbackRating(5);
        setFeedbackComment("");
      } else {
        setFeedbackError(res.data?.error || "Failed to send feedback");
      }
    } catch {
      toast.error("ችግር ተፈጥሯል🤯፣ እባክዎ እንደገና ይሞክሩ።", {
        position: "top-center",
      });
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    const nameEn = item.nameEn || item.name || "";
    const nameAm = item.nameAm || "";
    const normalizedName = (
      String(nameEn) +
      " " +
      String(nameAm)
    ).toLowerCase();
    const nameMatch = normalizedName.includes(
      String(searchQuery).toLowerCase(),
    );

    const priceETBStr = item.priceETB != null ? String(item.priceETB) : "";
    const priceUSDStr = item.priceUSD != null ? String(item.priceUSD) : "";
    const priceMatch =
      priceETBStr.includes(searchQuery) || priceUSDStr.includes(searchQuery);
    const matchesSearch = nameMatch || priceMatch;

    const matchesAvailability = hideUnavailable
      ? item.isAvailable !== false
      : true;

    const matchesFasting =
      fastingFilter === "all" ||
      (fastingFilter === "fasting" && item.isFasting) ||
      (fastingFilter === "nonFasting" && !item.isFasting);

    return (
      matchesCategory && matchesSearch && matchesFasting && matchesAvailability
    );
  });

  return (
    <div
      className={`min-h-screen font-sans pb-24 transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-2xl bg-white/90 p-2 shadow">
        <button
          onClick={() => setCurrency("ETB")}
          className={`px-3 py-1 rounded ${currency === "ETB" ? "bg-amber-500 text-white" : "bg-white text-slate-700 border"}`}
        >
          ETB
        </button>
        <button
          onClick={() => setCurrency("USD")}
          className={`px-3 py-1 rounded ${currency === "USD" ? "bg-amber-500 text-white" : "bg-white text-slate-700 border"}`}
        >
          USD
        </button>
        <label className="flex items-center gap-2 text-xs text-slate-700">
          <input
            type="checkbox"
            checked={hideUnavailable}
            onChange={(e) => {
              setHideUnavailable(e.target.checked);
            }}
          />
          Hide unavailable
        </label>
      </div>
      {/* 1. TOP NAVBAR SECTION - RESPONSIVE */}
      <nav
        className={`shadow-sm sticky top-0 z-50 px-3 sm:px-4 py-3 flex justify-between items-center border-b transition-colors duration-300 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-100"
        }`}
      >
        {/* Left: Hamburger Menu */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNavMenuOpen(!navMenuOpen)}
            className={`sm:hidden p-2 rounded-lg transition ${
              isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
            title="Menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Center: View Switcher (hidden on mobile) */}
        <div className="hidden sm:flex gap-2">
          <button
            onClick={() => setCurrentView("menu")}
            className={`font-bold text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-lg transition ${
              currentView === "menu"
                ? "bg-amber-500 text-white"
                : isDarkMode
                  ? "text-gray-400 hover:bg-gray-700"
                  : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t.menu}
          </button>
          <button
            onClick={() => setCurrentView("home")}
            className={`font-bold text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-lg transition ${
              currentView === "home"
                ? "bg-amber-500 text-white"
                : isDarkMode
                  ? "text-gray-400 hover:bg-gray-700"
                  : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t.home}
          </button>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition ${
              isDarkMode
                ? "bg-gray-700 text-yellow-400"
                : "bg-gray-100 text-gray-700"
            }`}
            title={isDarkMode ? t.lightMode : t.darkMode}
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>

          {/* Currency Toggle */}
          <button
            onClick={() => setCurrency(currency === "ETB" ? "USD" : "ETB")}
            className={`px-2 sm:px-2.5 py-1 rounded-md font-bold text-xs tracking-wider transition ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {currency === "ETB" ? "$" : "ብር"}
          </button>

          {/* Language Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-md font-bold text-xs uppercase transition border ${
                isDarkMode
                  ? "bg-amber-900 hover:bg-amber-800 text-amber-200 border-amber-700"
                  : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
              }`}
            >
              {lang}
              <svg
                className={`w-3 h-3 transition-transform ${langDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {langDropdownOpen && (
              <div
                className={`absolute right-0 mt-1.5 w-28 rounded-lg shadow-lg py-1 z-50 border ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-100"
                }`}
              >
                <button
                  onClick={() => {
                    setLang("am");
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold flex justify-between transition ${
                    isDarkMode
                      ? "text-gray-200 hover:bg-amber-900"
                      : "text-gray-700 hover:bg-amber-50"
                  }`}
                >
                  አማርኛ <span>🇪🇹</span>
                </button>
                <button
                  onClick={() => {
                    setLang("en");
                    setLangDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold flex justify-between transition ${
                    isDarkMode
                      ? "text-gray-200 hover:bg-amber-900"
                      : "text-gray-700 hover:bg-amber-50"
                  }`}
                >
                  English <span>🇺🇸</span>
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={onAdminOpen}
              className={`hidden sm:inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-bold uppercase transition ${
                isDarkMode
                  ? "border-amber-700 bg-amber-900 text-amber-100 hover:bg-amber-800"
                  : "border-amber-200 bg-white text-amber-700 hover:bg-amber-50"
              }`}
            >
              {t.adminButton}
            </button>
            <p className="hidden sm:block text-[11px] text-slate-500">
              {t.adminOnlyNotice}
            </p>
          </div>
        </div>
      </nav>

      {/* NAVIGATION MENU (Mobile Sidebar) */}
      {navMenuOpen && (
        <div
          className={`fixed inset-0 z-40 sm:hidden ${isDarkMode ? "bg-black/50" : "bg-black/30"}`}
          onClick={() => setNavMenuOpen(false)}
        >
          <div
            className={`w-64 h-full shadow-lg overflow-y-auto transition-colors duration-300 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu Header */}
            <div
              className={`p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Menu</h2>
                <button
                  onClick={() => setNavMenuOpen(false)}
                  className={`p-1 rounded ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                >
                  ✕
                </button>
              </div>

              {/* View Switcher for Mobile */}
              <div className="flex gap-2 sm:hidden">
                <button
                  onClick={() => {
                    setCurrentView("menu");
                    setNavMenuOpen(false);
                  }}
                  className={`flex-1 font-bold text-xs px-3 py-2 rounded-lg transition ${
                    currentView === "menu"
                      ? "bg-amber-500 text-white"
                      : isDarkMode
                        ? "bg-gray-700 text-gray-200"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {t.menu}
                </button>
              </div>
            </div>

            {/* Payment Methods (Dropdown) */}
            <div
              className={`p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}
            >
              <button
                type="button"
                onClick={() => {
                  setPaymentDropdownOpen((s) => !s);
                  setSocialDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs font-bold transition border ${
                  isDarkMode
                    ? "border-blue-700 bg-blue-900/30 text-blue-200 hover:bg-blue-900/45"
                    : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  💳 {t.payMethod}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${paymentDropdownOpen ? "rotate-180" : "rotate-0"}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {paymentDropdownOpen && (
                <div className="mt-3 space-y-3 text-xs">
                  <div
                    className={`p-3 rounded-lg border ${isDarkMode ? "bg-blue-900/30 border-blue-700" : "bg-blue-50 border-blue-200"}`}
                  >
                    <div className="font-bold mb-1 text-sm">{t.cbe}</div>
                    <div
                      className={`text-xs font-semibold ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}
                    >
                      1000234567890
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-lg border ${isDarkMode ? "bg-purple-900/30 border-purple-700" : "bg-purple-50 border-purple-200"}`}
                  >
                    <div className="font-bold mb-1 text-sm">{t.telebirr}</div>
                    <div
                      className={`text-xs font-semibold ${isDarkMode ? "text-purple-300" : "text-purple-700"}`}
                    >
                      +251911234567
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-lg border ${isDarkMode ? "bg-green-900/30 border-green-700" : "bg-green-50 border-green-200"}`}
                  >
                    <div className="font-bold mb-1 text-sm">{t.awash}</div>
                    <div
                      className={`text-xs font-semibold ${isDarkMode ? "text-green-300" : "text-green-700"}`}
                    >
                      01300567890
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-lg border ${isDarkMode ? "bg-red-900/30 border-red-700" : "bg-red-50 border-red-200"}`}
                  >
                    <div className="font-bold mb-1 text-sm">{t.abyssinia}</div>
                    <div
                      className={`text-xs font-semibold ${isDarkMode ? "text-red-300" : "text-red-700"}`}
                    >
                      1001234567
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Social Media (Dropdown) */}
            <div
              className={`p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}
            >
              <button
                type="button"
                onClick={() => {
                  setSocialDropdownOpen((s) => !s);
                  setPaymentDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs font-bold transition border ${
                  isDarkMode
                    ? "border-amber-700 bg-amber-900/50 text-amber-200 hover:bg-amber-900/30"
                    : "border-amber-200 bg-amber-100 text-amber-700 hover:bg-amber-50"
                }`}
              >
                <span className="flex items-center gap-2">📱 {t.social}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${socialDropdownOpen ? "rotate-180" : "rotate-0"}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {socialDropdownOpen && (
                <div className="mt-3 space-y-2">
                  <a
                    href="#telegram"
                    className={`block px-3 py-2 rounded-lg text-xs font-bold transition ${isDarkMode ? "bg-sky-900/30 text-sky-200 hover:bg-sky-900/50" : "bg-sky-50 text-sky-700 hover:bg-sky-100"}`}
                  >
                    ✈️ {t.telegram}
                  </a>
                  <a
                    href="#instagram"
                    className={`block px-3 py-2 rounded-lg text-xs font-bold transition ${isDarkMode ? "bg-pink-900/30 text-pink-200 hover:bg-pink-900/50" : "bg-pink-50 text-pink-700 hover:bg-pink-100"}`}
                  >
                    📸 {t.instagram}
                  </a>
                  <a
                    href="#tiktok"
                    className={`block px-3 py-2 rounded-lg text-xs font-bold transition ${isDarkMode ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-100 text-gray-900 hover:bg-gray-200"}`}
                  >
                    🎵 {t.tiktok}
                  </a>
                </div>
              )}

              <div className="mt-4 border-t border-slate-200/50 pt-4">
                <div className="mb-3">
                  <button
                    type="button"
                    onClick={() => setFeedbackOpen((s) => !s)}
                    className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs font-bold transition border ${
                      isDarkMode
                        ? "border-amber-700 bg-amber-900/30 text-amber-200 hover:bg-amber-900/45"
                        : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      ⭐ {t.feedback}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${feedbackOpen ? "rotate-180" : "rotate-0"}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>

                {feedbackOpen && (
                  <form onSubmit={submitFeedback} className="space-y-3">
                    <div>
                      <div
                        className={`text-xs font-bold mb-2 ${isDarkMode ? "text-amber-200" : "text-amber-700"}`}
                      >
                        {t.rating}
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setFeedbackRating(r)}
                            className={`flex-1 rounded-lg border px-2 py-2 text-xs font-bold transition ${
                              feedbackRating === r
                                ? isDarkMode
                                  ? "bg-amber-500 border-amber-400 text-gray-900"
                                  : "bg-amber-500 border-amber-400 text-white"
                                : isDarkMode
                                  ? "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
                                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                            }`}
                            aria-label={`Rating ${r}`}
                          >
                            {r}★
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div
                        className={`text-xs font-bold mb-2 ${isDarkMode ? "text-amber-200" : "text-amber-700"}`}
                      >
                        {t.comment}
                      </div>
                      <textarea
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        rows={4}
                        placeholder={t.write_your_feedback}
                        className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition ${
                          isDarkMode
                            ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 focus:border-amber-400"
                            : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-amber-500"
                        }`}
                        required
                      />
                    </div>

                    {feedbackError && (
                      <div
                        className={`text-xs rounded-lg px-3 py-2 ${isDarkMode ? "bg-red-900/30 text-red-200" : "bg-red-50 text-red-700"}`}
                      >
                        {feedbackError}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFeedbackOpen(false);
                          setFeedbackError("");
                        }}
                        className={`py-2.5 px-3 rounded-lg font-bold text-xs transition ${
                          isDarkMode
                            ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                        }`}
                      >
                        close
                      </button>
                      <button
                        type="submit"
                        disabled={feedbackSubmitting}
                        className={`py-2.5 px-3 rounded-lg font-bold text-xs text-white transition ${
                          feedbackSubmitting
                            ? isDarkMode
                              ? "bg-amber-900 cursor-not-allowed"
                              : "bg-amber-300 cursor-not-allowed"
                            : isDarkMode
                              ? "bg-amber-600 hover:bg-amber-700"
                              : "bg-amber-500 hover:bg-amber-600"
                        }`}
                      >
                        {feedbackSubmitting ? "Sending..." : "send"}
                      </button>
                    </div>
                  </form>
                )}

                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={() => {
                      onAdminOpen();
                      setNavMenuOpen(false);
                    }}
                    className={`w-full rounded-2xl px-3 py-2 text-center text-sm font-bold uppercase transition ${isDarkMode ? "bg-amber-700 text-white hover:bg-amber-600" : "bg-amber-500 text-white hover:bg-amber-600"}`}
                  >
                    {t.adminButton}
                  </button>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {t.adminOnlyNotice}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div
        className={`max-w-5xl mx-auto px-3 sm:px-4 mt-4 transition-colors duration-300`}
      >
        {currentView === "menu" ? (
          /* ================= MENU VIEW ================= */
          <>
            {/* Live Search Input */}
            <div className="relative mb-4">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className={`w-4 h-4 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder={t.searchPlh}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent shadow-sm transition border ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>

            {/* Category Tabs & Fasting Filter */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
              {/* Category & Fasting Tabs */}
              <div className="flex flex-col gap-2 flex-1">
                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {["all", "drinks", "breakfast", "snacks", "traditional"].map(
                    (cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition ${
                          activeCategory === cat
                            ? "bg-gray-900 text-white"
                            : isDarkMode
                              ? "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
                              : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
                        }`}
                      >
                        {t[cat]}
                      </button>
                    ),
                  )}
                </div>

                {/* Fasting Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {[
                    { value: "all", label: "🍽️ All Items" },
                    { value: "fasting", icon: "✨", label: t.fasting },
                    { value: "nonFasting", icon: "🥘", label: t.nonFasting },
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setFastingFilter(filter.value)}
                      className={`whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition ${
                        fastingFilter === filter.value
                          ? "bg-amber-500 text-white"
                          : isDarkMode
                            ? "bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700"
                            : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
                      }`}
                    >
                      {filter.value === "all"
                        ? filter.label
                        : `${filter.icon} ${filter.label}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout Toggle Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setLayoutMode("column")}
                  className={`p-2 rounded-lg transition ${
                    layoutMode === "column"
                      ? "bg-amber-500 text-white"
                      : isDarkMode
                        ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title={t.columnLayout}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 4h4v16H3V4zm6 0h4v16H9V4zm6 0h4v16h-4V4z" />
                  </svg>
                </button>
                <button
                  onClick={() => setLayoutMode("grid")}
                  className={`p-2 rounded-lg transition ${
                    layoutMode === "grid"
                      ? "bg-amber-500 text-white"
                      : isDarkMode
                        ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title={t.gridLayout}
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 3h7v7H3V3zm9 0h7v7h-7V3zM3 12h7v7H3v-7zm9 0h7v7h-7v-7z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Food Grid/List Display */}
            <div
              className={`${
                layoutMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
                  : "grid grid-cols-1 gap-4"
              }`}
            >
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedFood(item)}
                  className={`rounded-xl shadow-sm p-3 border transition hover:shadow-md cursor-pointer ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 hover:border-amber-500"
                      : "bg-white border-gray-100 hover:border-amber-400"
                  } ${layoutMode === "grid" ? "flex flex-col" : "flex gap-3"}`}
                >
                  <img
                    src={item.image }
                    alt={item.nameEn}
                    className={`rounded-lg object-cover flex-shrink-0 ${
                      layoutMode === "grid" ? "w-full h-40" : "w-24 h-24"
                    }`}
                  />
                  <div className="flex flex-col justify-between flex-grow">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4
                          className={`font-bold text-base ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}
                        >
                          {lang === "am" ? item.nameAm : item.nameEn}
                        </h4>
                        {item.isFasting && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${
                              isDarkMode
                                ? "bg-green-900/30 text-green-300 border-green-700"
                                : "bg-green-50 text-green-600 border-green-200"
                            }`}
                          >
                            {t.fasting}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs line-clamp-2 mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        {lang === "am" ? item.descAm : item.descEn}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <span
                        className={`font-black text-base ${isDarkMode ? "text-amber-400" : "text-gray-900"}`}
                      >
                        {currency === "ETB"
                          ? `${item.priceETB} ብር`
                          : `$${item.priceUSD}`}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item);
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                      >
                        + {t.add}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* ================= HOME INFO VIEW ================= */
          <div
            className={`rounded-2xl p-5 sm:p-8 shadow-sm border transition-colors duration-300 ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-100"
            }`}
          >
            {/* Restaurant Header */}
            <div className="text-center mb-6">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 ${
                  isDarkMode ? "bg-amber-900/30" : "bg-amber-100"
                }`}
              >
                <span className="text-4xl">☕</span>
              </div>
              <h1
                className={`text-2xl sm:text-3xl font-black mb-1 ${isDarkMode ? "text-amber-400" : "text-amber-600"}`}
              >
                {lang === "am" ? RESTAURANT_INFO.nameAm : RESTAURANT_INFO.name}
              </h1>
              <p
                className={`text-sm font-semibold mb-3 ${isDarkMode ? "text-amber-300" : "text-amber-700"}`}
              >
                {lang === "am"
                  ? RESTAURANT_INFO.taglineAm
                  : RESTAURANT_INFO.tagline}
              </p>
              <p
                className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                {lang === "am"
                  ? RESTAURANT_INFO.locationAm
                  : RESTAURANT_INFO.location}
              </p>
              <p
                className={`text-xs mt-2 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
              >
                📞 {RESTAURANT_INFO.phone}
              </p>
            </div>

            <hr
              className={`my-6 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
            />

            {/* Payment Methods Section */}
            <div className="mb-8">
              <h4
                className={`font-extrabold text-sm uppercase tracking-wider mb-4 ${
                  isDarkMode ? "text-amber-400" : "text-gray-600"
                }`}
              >
                💳 {t.payMethod}
              </h4>
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3`}>
                <div
                  className={`p-4 rounded-xl border ${
                    isDarkMode
                      ? "bg-blue-900/30 border-blue-700"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div
                    className={`font-bold text-sm mb-2 ${isDarkMode ? "text-blue-300" : "text-blue-900"}`}
                  >
                    {t.cbe}
                  </div>
                  <div
                    className={`text-xs font-mono ${isDarkMode ? "text-blue-400" : "text-blue-700"}`}
                  >
                    {t.cbeAcc}
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border ${
                    isDarkMode
                      ? "bg-purple-900/30 border-purple-700"
                      : "bg-purple-50 border-purple-200"
                  }`}
                >
                  <div
                    className={`font-bold text-sm mb-2 ${isDarkMode ? "text-purple-300" : "text-purple-900"}`}
                  >
                    {t.telebirr}
                  </div>
                  <div
                    className={`text-xs ${isDarkMode ? "text-purple-400" : "text-purple-700"}`}
                  >
                    +251911234567
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border ${
                    isDarkMode
                      ? "bg-green-900/30 border-green-700"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <div
                    className={`font-bold text-sm mb-2 ${isDarkMode ? "text-green-300" : "text-green-900"}`}
                  >
                    {t.awash}
                  </div>
                  <div
                    className={`text-xs ${isDarkMode ? "text-green-400" : "text-green-700"}`}
                  >
                    Account: 1000567890
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border ${
                    isDarkMode
                      ? "bg-red-900/30 border-red-700"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div
                    className={`font-bold text-sm mb-2 ${isDarkMode ? "text-red-300" : "text-red-900"}`}
                  >
                    {t.abyssinia}
                  </div>
                  <div
                    className={`text-xs ${isDarkMode ? "text-red-400" : "text-red-700"}`}
                  >
                    Account: 1001234567
                  </div>
                </div>
              </div>
            </div>

            <hr
              className={`my-6 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
            />

            {/* Social Media Section */}
            <div>
              <h4
                className={`font-extrabold text-sm uppercase tracking-wider mb-4 ${
                  isDarkMode ? "text-amber-400" : "text-gray-600"
                }`}
              >
                📱 {t.social}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <a
                  href="#telegram"
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition ${
                    isDarkMode
                      ? "bg-sky-900/30 text-sky-300 hover:bg-sky-900/50 border border-sky-700"
                      : "bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200"
                  }`}
                >
                  ✈️ Telegram
                </a>
                <a
                  href="#instagram"
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition ${
                    isDarkMode
                      ? "bg-pink-900/30 text-pink-300 hover:bg-pink-900/50 border border-pink-700"
                      : "bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200"
                  }`}
                >
                  📸 Instagram
                </a>
                <a
                  href="#tiktok"
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition ${
                    isDarkMode
                      ? "bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300"
                  }`}
                >
                  🎵 TikTok
                </a>
                <a
                  href="#youtube"
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition ${
                    isDarkMode
                      ? "bg-red-900/30 text-red-300 hover:bg-red-900/50 border border-red-700"
                      : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                  }`}
                >
                  ▶️ YouTube
                </a>
              </div>
            </div>

            {/* Feedback Section (Home) */}
            <div className="mt-6 border-t pt-4">
              <div className="mb-3">
                <h4
                  className={`font-extrabold text-sm uppercase tracking-wider mb-3 ${
                    isDarkMode ? "text-amber-400" : "text-gray-600"
                  }`}
                >
                  ⭐ {t.feedback}
                </h4>
              </div>

              {/* Keep existing mobile feedbackOpen behavior & UI logic */}
              {!feedbackOpen ? (
                <button
                  type="button"
                  onClick={() => setFeedbackOpen(true)}
                  className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs font-bold transition border ${
                    isDarkMode
                      ? "border-amber-700 bg-amber-900/30 text-amber-200 hover:bg-amber-900/45"
                      : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    ⭐ {t.feedback}
                  </span>
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 5v14M5 12h14"
                    />
                  </svg>
                </button>
              ) : (
                <form onSubmit={submitFeedback} className="space-y-3">
                  <div>
                    <div
                      className={`text-xs font-bold mb-2 ${
                        isDarkMode ? "text-amber-200" : "text-amber-700"
                      }`}
                    >
                      {t.rating}
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setFeedbackRating(r)}
                          className={`flex-1 rounded-lg border px-2 py-2 text-xs font-bold transition ${
                            feedbackRating === r
                              ? isDarkMode
                                ? "bg-amber-500 border-amber-400 text-gray-900"
                                : "bg-amber-500 border-amber-400 text-white"
                              : isDarkMode
                                ? "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
                                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                          aria-label={`Rating ${r}`}
                        >
                          {r}★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div
                      className={`text-xs font-bold mb-2 ${
                        isDarkMode ? "text-amber-200" : "text-amber-700"
                      }`}
                    >
                      {t.comment}
                    </div>
                    <textarea
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      rows={4}
                      placeholder={t.write_your_feedback}
                      className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 focus:border-amber-400"
                          : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-amber-500"
                      }`}
                      required
                    />
                  </div>

                  {feedbackError && (
                    <div
                      className={`text-xs rounded-lg px-3 py-2 ${
                        isDarkMode
                          ? "bg-red-900/30 text-red-200"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {feedbackError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackOpen(false);
                        setFeedbackError("");
                      }}
                      className={`py-2.5 px-3 rounded-lg font-bold text-xs transition ${
                        isDarkMode
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                      }`}
                    >
                      close
                    </button>
                    <button
                      type="submit"
                      disabled={feedbackSubmitting}
                      className={`py-2.5 px-3 rounded-lg font-bold text-xs text-white transition ${
                        feedbackSubmitting
                          ? isDarkMode
                            ? "bg-amber-900 cursor-not-allowed"
                            : "bg-amber-300 cursor-not-allowed"
                          : isDarkMode
                            ? "bg-amber-600 hover:bg-amber-700"
                            : "bg-amber-500 hover:bg-amber-600"
                      }`}
                    >
                      {feedbackSubmitting ? "Sending..." : "send"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FLOATING TOTAL BILL BAR */}
      {cart.length > 0 && (
        <div
          className={`fixed bottom-0 left-0 right-0 shadow-xl px-3 sm:px-4 py-4 flex justify-between items-center z-40 rounded-t-2xl border-t transition-colors duration-300 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div>
            <p
              className={`text-[10px] uppercase tracking-wider font-bold ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              {t.total}
            </p>
            <p
              className={`text-xl sm:text-2xl font-black ${isDarkMode ? "text-amber-400" : "text-amber-600"}`}
            >
              {currency === "ETB"
                ? `${calculateTotal()} ብር`
                : `$${calculateTotal()}`}
            </p>
          </div>
          <button
            onClick={() => setCartViewOpen(true)}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition ${
              isDarkMode
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-gray-900 hover:bg-gray-800 text-white"
            }`}
          >
            {t.viewOrder} ({cart.reduce((a, b) => a + b.qty, 0)})
          </button>
        </div>
      )}

      {/* CART VIEW MODAL */}
      {cartViewOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center ${isDarkMode ? "bg-black/50" : "bg-black/30"}`}
          onClick={() => setCartViewOpen(false)}
        >
          <div
            className={`w-full sm:w-96 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-96 overflow-y-auto transition-colors duration-300 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cart Header */}
            <div
              className={`sticky top-0 p-4 border-b flex justify-between items-center ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h2 className="text-lg font-bold">{t.menu}</h2>
              <button
                onClick={() => setCartViewOpen(false)}
                className={`p-1 rounded text-xl transition ${
                  isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
              >
                ✕
              </button>
            </div>

            {/* Cart Items */}
            {cart.length === 0 ? (
              <div className="p-8 text-center">
                <p
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  {t.cartEmpty}
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className={`flex gap-3 p-3 rounded-lg border transition ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={item.nameEn}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-grow">
                      <h4
                        className={`font-bold text-sm ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}
                      >
                        {lang === "am" ? item.nameAm : item.nameEn}
                      </h4>
                      <p
                        className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        {currency === "ETB"
                          ? `${item.priceETB} ብር`
                          : `$${item.priceUSD}`}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateCartQty(item.id, item.qty - 1)}
                          className={`px-2 py-1 rounded text-xs font-bold transition ${
                            isDarkMode
                              ? "bg-gray-600 hover:bg-gray-500 text-white"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                          }`}
                        >
                          −
                        </button>
                        <span className="text-xs font-bold px-2">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.id, item.qty + 1)}
                          className={`px-2 py-1 rounded text-xs font-bold transition ${
                            isDarkMode
                              ? "bg-gray-600 hover:bg-gray-500 text-white"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                          }`}
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-auto px-3 py-1 rounded text-xs font-bold bg-red-500 hover:bg-red-600 text-white transition"
                        >
                          {t.remove}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Subtotal */}
                <div
                  className={`p-4 border-t rounded-lg mt-4 ${
                    isDarkMode ? "border-gray-600" : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span
                      className={`font-bold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      {t.subtotal}:
                    </span>
                    <span
                      className={`text-lg font-black ${isDarkMode ? "text-amber-400" : "text-amber-600"}`}
                    >
                      {currency === "ETB"
                        ? `${calculateTotal()} ብር`
                        : `$${calculateTotal()}`}
                    </span>
                  </div>

                  {/* Checkout & Clear Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => clearCart()}
                      className={`py-2.5 px-4 rounded-lg font-bold text-xs transition ${
                        isDarkMode
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                      }`}
                    >
                      {t.clearCart}
                    </button>
                    <button
                      onClick={() => {
                        alert(`${t.checkout}: ${calculateTotal()} ${currency}`);
                        clearCart();
                      }}
                      className={`py-2.5 px-4 rounded-lg font-bold text-xs text-white transition ${
                        isDarkMode
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "bg-amber-500 hover:bg-amber-600"
                      }`}
                    >
                      {t.checkout}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOD DETAIL MODAL */}
      {selectedFood && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center ${isDarkMode ? "bg-black/50" : "bg-black/30"}`}
          onClick={() => setSelectedFood(null)}
        >
          <div
            className={`w-full sm:w-2xl rounded-2xl shadow-2xl max-h-96 overflow-y-auto transition-colors duration-300 mx-3 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Image */}
            <div className="relative">
              <img
                src={selectedFood.image}
                alt={selectedFood.nameEn}
                className="w-full h-48 object-cover rounded-t-2xl"
              />
              <button
                onClick={() => setSelectedFood(null)}
                className={`absolute top-3 right-3 p-2 rounded-full ${isDarkMode ? "bg-gray-800/80 text-white" : "bg-white/80"}`}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Title & Price */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2
                    className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {lang === "am" ? selectedFood.nameAm : selectedFood.nameEn}
                  </h2>
                  <p
                    className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {lang === "am" ? selectedFood.descAm : selectedFood.descEn}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div
                className="mb-6 pb-6 border-b"
                style={{ borderColor: isDarkMode ? "#374151" : "#e5e7eb" }}
              >
                <span
                  className={`text-3xl font-black ${isDarkMode ? "text-amber-400" : "text-amber-600"}`}
                >
                  {currency === "ETB"
                    ? `${selectedFood.priceETB} ብር`
                    : `$${selectedFood.priceUSD}`}
                </span>
              </div>

              {/* Ingredients Section */}
              <div className="mb-6">
                <h3
                  className={`text-lg font-bold mb-3 ${isDarkMode ? "text-amber-400" : "text-amber-600"}`}
                >
                  🥘 {t.ingredients}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(lang === "am"
                    ? selectedFood.ingredientsAm
                    : selectedFood.ingredientsEn
                  ).map((ingredient, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                        isDarkMode
                          ? "bg-gray-700 text-gray-200"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>

              {/* Nutrition Facts */}
              <div className="mb-6">
                <h3
                  className={`text-lg font-bold mb-3 ${isDarkMode ? "text-amber-400" : "text-amber-600"}`}
                >
                  📊 {t.nutrition}
                </h3>
                <div
                  className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}
                >
                  <div className="text-xs text-gray-500 mb-3">
                    {t.servingSize}: {selectedFood.nutrition.servingSize}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="text-center">
                      <div
                        className={`text-sm font-bold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                      >
                        {selectedFood.nutrition.calories}
                      </div>
                      <div
                        className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        {t.calories}
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-sm font-bold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                      >
                        {selectedFood.nutrition.protein}g
                      </div>
                      <div
                        className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        {t.protein}
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-sm font-bold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                      >
                        {selectedFood.nutrition.carbs}g
                      </div>
                      <div
                        className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        {t.carbs}
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-sm font-bold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                      >
                        {selectedFood.nutrition.fat}g
                      </div>
                      <div
                        className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        {t.fat}
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-sm font-bold ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                      >
                        {selectedFood.nutrition.fiber}g
                      </div>
                      <div
                        className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        {t.fiber}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                className="flex gap-3 pt-4 border-t"
                style={{ borderColor: isDarkMode ? "#374151" : "#e5e7eb" }}
              >
                <button
                  onClick={() => {
                    addToCart(selectedFood);
                    setSelectedFood(null);
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg font-bold text-white transition ${
                    isDarkMode
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-amber-500 hover:bg-amber-600"
                  }`}
                >
                  {t.addToCart}
                </button>
                <button
                  onClick={() => setSelectedFood(null)}
                  className={`flex-1 py-3 px-4 rounded-lg font-bold transition ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  }`}
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
