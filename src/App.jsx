import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DigitalMenu from "./DigitalMenu";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";
import axiosInstance from "./api/axiosInstance";

export default function App() {
  const [view, setView] = useState("menu");
  const [isAdmin, setIsAdmin] = useState(false);
  // token is stored inside AdminDashboard via localStorage

  const [lang, setLang] = useState("en");

  const handleLogin = async (password) => {
    try {
      const res = await axiosInstance.post(
        "/api/admin/login",
        { password },
        { headers: { "Content-Type": "application/json" } },
      );

      const data = res.data;
      if (!data?.token) return false;

      localStorage.setItem("adminToken", String(data.token));
      setIsAdmin(true);
      setView("dashboard");
      return true;
    } catch {
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAdmin(false);
    setView("menu");
  };

  if (view === "admin") {
    return (
      <AdminLogin
        onLogin={handleLogin}
        onCancel={() => setView("menu")}
        lang={lang}
        setLang={setLang}
      />
    );
  }

  if (view === "dashboard" && isAdmin) {
    return (
      <AdminDashboard onLogout={handleLogout} lang={lang} setLang={setLang} />
    );
  }

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <DigitalMenu onAdminOpen={() => setView("admin")} />
      <div className="mt-4 pt-3 border-t border-slate-200 text-center text-xs text-slate-500">
        <p>
          Built with ❤️ by{" "}
          <a
            href="https://olyadgetnet.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-amber-600 transition hover:text-amber-700 hover:underline"
          >
            Olyad.G
          </a>
        </p>
      </div>
    </>
  );
}
