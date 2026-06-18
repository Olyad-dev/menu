import { useState } from "react";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import translations from "./i18n";

const AdminLogin = ({ onLogin, onCancel, lang = "en" }) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const t = translations[lang] || translations.en;

  const submitForm = async (event) => {
    event.preventDefault();
    const success = onLogin(password);
    if (!success) {
      setError("Password is incorrect. Please try again.");
      toast.error(t.wrongPassword, {
        position: "top-center",
        theme: "light",
      });
    } else {
      setError("");
      toast.success("Admin login successful", {
        position: "top-center",
        theme: "light",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold mb-2 text-slate-900">
          {t.loginTitle}
        </h1>
        <p className="text-sm text-slate-500 mb-6">{t.loginDesc}</p>
        <form onSubmit={submitForm} className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700">
            {t.password}
            <div className="relative w-full">
    <input
      value={password}
      onChange={(e) => {
        setPassword(e.target.value);
        setError("");
      }}
      type={showPassword ? "text" : "password"}
      className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-3 pl-4 pr-12 text-sm outline-none transition focus:border-amber-500"
      placeholder="Enter admin password"
    />
    
    <button
      type="button" 
      onClick={() => setShowPassword(!showPassword)} 
      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dynamic-transition"
    >
      {showPassword ? (
        <EyeOff className="h-5 w-5" /> 
      ) : (
        <Eye className="h-5 w-5" />
      )}
    </button>
  </div>
            
          </label>
          {error && (
            <div className="text-sm text-red-600">{t.wrongPassword}</div>
          )}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="w-full rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-600"
            >
              {t.continue}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
