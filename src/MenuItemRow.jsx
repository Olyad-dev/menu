import { useState } from "react";
import translations from "./i18n";

const MenuItemRow = ({ item, onUpdate, onDelete, lang = "en" }) => {
  const [priceETB, setPriceETB] = useState(item.priceETB);
  const [isAvailable, setIsAvailable] = useState(item.isAvailable);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({
    nameEn: item.nameEn || item.name || "",
    nameAm: item.nameAm || item.name || "",
    category: item.category ? String(item.category).toLowerCase() : "",
    descriptionEn: item.descEn || item.description || "",
    descriptionAm: item.descAm || item.description || "",
    priceETB: item.priceETB,
    isAvailable: item.isAvailable,
    isFasting: item.isFasting,
    ingredientsEn: Array.isArray(item.ingredientsEn)
      ? item.ingredientsEn.join(", ")
      : item.ingredientsEn || "",
    ingredientsAm: Array.isArray(item.ingredientsAm)
      ? item.ingredientsAm.join(", ")
      : item.ingredientsAm || "",
    image: item.image || "",
    nutrition: {
      calories: item.nutrition?.calories || "",
      protein: item.nutrition?.protein || "",
      carbs: item.nutrition?.carbs || "",
      fat: item.nutrition?.fat || "",
      fiber: item.nutrition?.fiber || "",
      servingSize: item.nutrition?.servingSize || "",
    },
  });

  const handlePriceChange = (e) => {
    const newPrice = e.target.value;
    if (newPrice === "" || Number(newPrice) >= 0) {
      setPriceETB(newPrice);
    }
  };

  const savePrice = async () => {
    const numericValue = Number(priceETB);
    if (priceETB === "" || isNaN(numericValue) || numericValue < 0) {
      return;
    }
    setSaving(true);
    await onUpdate(item.id, { priceETB: numericValue });
    setSaving(false);
  };

  const toggleAvailability = async () => {
    const newAvailability = !isAvailable;
    setIsAvailable(newAvailability);
    await onUpdate(item.id, { isAvailable: newAvailability });
  };

  const handleDraftChange = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleNutritionChange = (field, value) => {
    setDraft((prev) => ({
      ...prev,
      nutrition: { ...prev.nutrition, [field]: value },
    }));
  };

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDraft((prev) => ({ ...prev, imageFile: file, image: "" }));
  };

  const t = translations[lang] || translations.en;
  const displayName =
    lang === "am"
      ? item.nameAm || item.nameEn || item.name || ""
      : item.nameEn || item.name || item.nameAm || "";
  const displayDescription =
    lang === "am"
      ? item.descAm || item.descEn || item.description || ""
      : item.descEn || item.description || item.descAm || "";
  const displayIngredients =
    lang === "am"
      ? item.ingredientsAm || item.ingredientsEn || []
      : item.ingredientsEn || item.ingredientsAm || [];

  const startEdit = () => {
    setDraft({
      nameEn: item.nameEn || item.name || "",
      nameAm: item.nameAm || item.name || "",
      category: item.category ? String(item.category).toLowerCase() : "",
      descriptionEn: item.descEn || item.description || "",
      descriptionAm: item.descAm || item.description || "",
      priceETB: item.priceETB,
      isAvailable: item.isAvailable,
      isFasting: item.isFasting,
      ingredientsEn: Array.isArray(item.ingredientsEn)
        ? item.ingredientsEn.join(", ")
        : item.ingredientsEn || "",
      ingredientsAm: Array.isArray(item.ingredientsAm)
        ? item.ingredientsAm.join(", ")
        : item.ingredientsAm || "",
      image: item.image || "",
      nutrition: {
        calories: item.nutrition?.calories || "",
        protein: item.nutrition?.protein || "",
        carbs: item.nutrition?.carbs || "",
        fat: item.nutrition?.fat || "",
        fiber: item.nutrition?.fiber || "",
        servingSize: item.nutrition?.servingSize || "",
      },
    });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDraft({
      nameEn: item.nameEn || item.name || "",
      nameAm: item.nameAm || item.name || "",
      category: item.category ? String(item.category).toLowerCase() : "",
      descriptionEn: item.descEn || item.description || "",
      descriptionAm: item.descAm || item.description || "",
      priceETB: item.priceETB,
      isAvailable: item.isAvailable,
      isFasting: item.isFasting,
      ingredientsEn: Array.isArray(item.ingredientsEn)
        ? item.ingredientsEn.join(", ")
        : item.ingredientsEn || "",
      ingredientsAm: Array.isArray(item.ingredientsAm)
        ? item.ingredientsAm.join(", ")
        : item.ingredientsAm || "",
      image: item.image || "",
      nutrition: {
        calories: item.nutrition?.calories || "",
        protein: item.nutrition?.protein || "",
        carbs: item.nutrition?.carbs || "",
        fat: item.nutrition?.fat || "",
        fiber: item.nutrition?.fiber || "",
        servingSize: item.nutrition?.servingSize || "",
      },
    });
  };

  const saveDetails = async () => {
    const numericValue = Number(draft.priceETB);
    if (
      draft.nameEn.trim() === "" ||
      draft.nameAm.trim() === "" ||
      isNaN(numericValue) ||
      numericValue < 0
    ) {
      return;
    }

    setSaving(true);

    // Build multipart form for PATCH
    const formData = new FormData();
    formData.append("nameEn", draft.nameEn.trim());
    formData.append("nameAm", draft.nameAm.trim());
    formData.append("name", draft.nameEn.trim());
    formData.append("category", draft.category.trim());
    formData.append("description", draft.descriptionEn.trim());
    formData.append("descEn", draft.descriptionEn.trim());
    formData.append("descAm", draft.descriptionAm.trim());
    formData.append("priceETB", String(numericValue));
    formData.append("isAvailable", String(!!draft.isAvailable));
    formData.append("isFasting", String(!!draft.isFasting));

    const ingredientsEn = draft.ingredientsEn
      ? String(draft.ingredientsEn)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const ingredientsAm = draft.ingredientsAm
      ? String(draft.ingredientsAm)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    formData.append("ingredientsEn", JSON.stringify(ingredientsEn));
    formData.append("ingredientsAm", JSON.stringify(ingredientsAm));

    const nutrition = {
      calories: Number(draft.nutrition.calories) || 0,
      protein: Number(draft.nutrition.protein) || 0,
      carbs: Number(draft.nutrition.carbs) || 0,
      fat: Number(draft.nutrition.fat) || 0,
      fiber: Number(draft.nutrition.fiber) || 0,
      servingSize: draft.nutrition.servingSize || "",
    };
    formData.append("nutrition", JSON.stringify(nutrition));

    if (draft.imageFile) {
      formData.append("image", draft.imageFile);
    } else if (draft.image) {
      // fallback if user entered URL manually
      formData.append("image", draft.image || "");
    }

    await onUpdate(item.id, formData, { multipart: true });
    setSaving(false);
    setIsEditing(false);
    setPriceETB(numericValue);
    setIsAvailable(draft.isAvailable);
  };

  return (
    <div
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 transition ${
        !isAvailable ? "opacity-60" : ""
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          {item.image && (
            <img
              src={item.image}
              alt="item"
              className="h-16 w-16 rounded-md object-cover"
            />
          )}
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {displayName}{" "}
              {item.isFasting ? (
                <span className="ml-2 text-xs text-amber-600">
                  ({t.fastingItem})
                </span>
              ) : null}
            </h3>
            <p className="text-sm text-slate-600">
              {t[item.category] ||
                (item.category
                  ? item.category.charAt(0).toUpperCase() +
                    item.category.slice(1)
                  : "")}
            </p>
            <p className="text-sm text-slate-500">{displayDescription}</p>
            {Array.isArray(displayIngredients) &&
              displayIngredients.length > 0 && (
                <p className="text-sm text-slate-500 mt-1">
                  {t.ingredientsLabel} {displayIngredients.join(", ")}
                </p>
              )}
            {item.nutrition && (
              <div className="mt-2 text-xs text-slate-500">
                <span>Cal {item.nutrition.calories} </span>
                <span className="mx-2">·</span>
                <span>P {item.nutrition.protein}g</span>
                <span className="mx-2">·</span>
                <span>C {item.nutrition.carbs}g</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">{t.etb}</span>
            <input
              type="number"
              min="0"
              value={priceETB}
              onChange={handlePriceChange}
              onBlur={savePrice}
              className="w-24 rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
            />
            {saving && (
              <span className="text-sm text-slate-500">{t.saving}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={toggleAvailability}
              className={`rounded-2xl px-3 py-2 text-sm font-semibold text-white transition ${
                isAvailable
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {isAvailable ? t.available : t.outOfStock}
            </button>
            <button
              onClick={startEdit}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {t.edit}
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="rounded-2xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              {t.delete}
            </button>
          </div>
          <div className="text-xs text-slate-500">
            {t.usd} {item.priceUSD ?? Math.round(Number(item.priceETB) / 55)}
          </div>
        </div>
      </div>
      {isEditing && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-slate-700">
              {t.nameEnLabel}
              <input
                value={draft.nameEn}
                onChange={(e) => handleDraftChange("nameEn", e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
              />
            </label>
            <label className="block text-sm text-slate-700">
              {t.nameAmLabel}
              <input
                value={draft.nameAm}
                onChange={(e) => handleDraftChange("nameAm", e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
              />
            </label>
            <label className="block text-sm text-slate-700">
              {t.category}
              <select
                value={draft.category}
                onChange={(e) => handleDraftChange("category", e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
              >
                {["mains", "drinks", "breakfast", "snacks", "traditional"].map(
                  (c) => (
                    <option key={c} value={c}>
                      {t[c] || c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ),
                )}
              </select>
            </label>
            <label className="block text-sm text-slate-700">
              {t.priceETB}
              <input
                type="number"
                min="0"
                value={draft.priceETB}
                onChange={(e) => handleDraftChange("priceETB", e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
              />
            </label>
            <label className="block text-sm text-slate-700 sm:col-span-2">
              {t.descriptionEnLabel}
              <textarea
                value={draft.descriptionEn}
                onChange={(e) =>
                  handleDraftChange("descriptionEn", e.target.value)
                }
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                rows={3}
              />
            </label>
            <label className="block text-sm text-slate-700 sm:col-span-2">
              {t.descriptionAmLabel}
              <textarea
                value={draft.descriptionAm}
                onChange={(e) =>
                  handleDraftChange("descriptionAm", e.target.value)
                }
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                rows={3}
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={draft.isAvailable}
                onChange={(e) =>
                  handleDraftChange("isAvailable", e.target.checked)
                }
                className="h-5 w-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
              />
              {t.availableNow}
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={draft.isFasting}
                onChange={(e) =>
                  handleDraftChange("isFasting", e.target.checked)
                }
                className="h-5 w-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
              />
              {t.fastingItem}
            </label>
            <label className="block text-sm text-slate-700">
              {t.imageUpload}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFile}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={draft.image}
                onChange={(e) => handleDraftChange("image", e.target.value)}
                placeholder={t.imageUrlPlaceholder}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
              />
              {draft.image && (
                <div className="mt-2">
                  <img
                    src={draft.image}
                    alt="preview"
                    className="h-20 w-20 rounded-md object-cover"
                  />
                </div>
              )}
            </label>
            <label className="block text-sm text-slate-700">
              {t.ingredientsEnLabel}
              <input
                type="text"
                value={draft.ingredientsEn}
                onChange={(e) =>
                  handleDraftChange("ingredientsEn", e.target.value)
                }
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
              />
            </label>
            <label className="block text-sm text-slate-700">
              {t.ingredientsAmLabel}
              <input
                type="text"
                value={draft.ingredientsAm}
                onChange={(e) =>
                  handleDraftChange("ingredientsAm", e.target.value)
                }
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
              />
            </label>
            <div className="sm:col-span-2 grid grid-cols-2 gap-3">
              <label className="block text-sm text-slate-700">
                {t.calories}
                <input
                  type="number"
                  value={draft.nutrition.calories}
                  onChange={(e) =>
                    handleNutritionChange("calories", e.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                />
              </label>
              <label className="block text-sm text-slate-700">
                {t.protein}
                <input
                  type="number"
                  value={draft.nutrition.protein}
                  onChange={(e) =>
                    handleNutritionChange("protein", e.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                />
              </label>
              <label className="block text-sm text-slate-700">
                {t.carbs}
                <input
                  type="number"
                  value={draft.nutrition.carbs}
                  onChange={(e) =>
                    handleNutritionChange("carbs", e.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                />
              </label>
              <label className="block text-sm text-slate-700">
                {t.fat}
                <input
                  type="number"
                  value={draft.nutrition.fat}
                  onChange={(e) => handleNutritionChange("fat", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                />
              </label>
              <label className="block text-sm text-slate-700">
                {t.fiber}
                <input
                  type="number"
                  value={draft.nutrition.fiber}
                  onChange={(e) =>
                    handleNutritionChange("fiber", e.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                />
              </label>
              <label className="block text-sm text-slate-700">
                {t.servingSize}
                <input
                  type="text"
                  value={draft.nutrition.servingSize}
                  onChange={(e) =>
                    handleNutritionChange("servingSize", e.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none"
                />
              </label>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={saveDetails}
              disabled={saving}
              className="rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
            >
              {saving ? t.saving : t.saveChanges}
            </button>
            <button
              onClick={cancelEdit}
              disabled={saving}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuItemRow;
