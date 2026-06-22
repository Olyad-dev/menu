import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axiosInstance from "./api/axiosInstance";

const AdminChangePassword = ({ onDone }) => {

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);


  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("adminToken") || "";

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axiosInstance.post(
        "/api/admin/change-password",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data?.ok) {
        // logout/close modal in parent
        if (onDone) onDone();
      } else {
        setError(res.data?.error || "Failed to change password.");
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to change password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Change Password
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Enter your current password and choose a new one.
        </p>

        <form onSubmit={submit} className="space-y-4">
          {/* 1. Current Password Input */}
          <div className="flex flex-col gap-1">
            <label className="block text-sm font-semibold text-slate-700">
              Current password
            </label>
            <div className="relative w-full">
              <input
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                type={showCurrent ? "text" : "password"}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 pl-4 pr-12 py-3 text-sm outline-none transition focus:border-amber-500"
                placeholder="Enter current password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* 2. New Password Input */}
          <div className="flex flex-col gap-1">
            <label className="block text-sm font-semibold text-slate-700">
              New password
            </label>
            <div className="relative w-full">
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type={showNew ? "text" : "password"}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 pl-4 pr-12 py-3 text-sm outline-none transition focus:border-amber-500"
                placeholder="Enter new password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNew ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* 3. Confirm New Password Input */}
          <div className="flex flex-col gap-1">
            <label className="block text-sm font-semibold text-slate-700">
              Confirm new password
            </label>
            <div className="relative w-full">
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type={showConfirm ? "text" : "password"}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 pl-4 pr-12 py-3 text-sm outline-none transition focus:border-amber-500"
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onDone}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
            >
              {submitting ? "Changing..." : "Change Password"}
            </button>
          </div>

          <div className="text-xs text-slate-500">
            Note: Password length must be at least 8 characters.
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminChangePassword;
