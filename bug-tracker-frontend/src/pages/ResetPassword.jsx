// src/ResetPassword.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function ResetPassword() {
  const nav = useNavigate();
  const loc = useLocation();

  const emailFromState = loc.state?.email || "";
  const resetToken = loc.state?.resetToken || null;

  const [email, setEmail] = useState(emailFromState);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { resetPassword, loading, error, info } = useAuthStore();

  const passwordStrength = (pw) => {
    if (!pw) return { score: 0, label: "Too short" };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const label = score <= 1 ? "Weak" : score <= 3 ? "Medium" : "Strong";
    return { score, label };
  };

  const strength = passwordStrength(password);

  const submit = async (e) => {
    e?.preventDefault();
    if (!email) return;
    if (!password || password.length < 6) return;
    if (password !== confirm) return;

    const ok = await resetPassword(email.toLowerCase(), password, resetToken);
    if (ok) {
      setTimeout(() => nav("/login"), 900);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-12">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="order-2 md:order-1 w-full md:w-1/2 bg-gradient-to-b from-white to-indigo-50 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-10">
            <img
              src="/logo.svg"
              alt="EnterSoft Bug Tracker"
              className="w-44 sm:w-56 md:w-64 lg:w-72"
            />
            <p className="mt-4 text-center text-sm text-slate-500 max-w-xs">
              OTP verified successfully. Now create a strong password to secure
              your account.
            </p>
          </div>

          <div className="order-1 md:order-2 w-full md:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-600">
                ✓
              </div>
              <p className="text-sm font-medium text-green-700">OTP verified</p>
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-2">
              Set new password
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Choose a secure password you’ll remember.
            </p>

            {info && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700">
                {info}
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="text-xs font-medium text-slate-600">
                  Registered email
                </span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="mt-2 block w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm bg-gray-50 placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                  disabled
                />
              </label>

              <label className="block relative">
                <span className="text-xs font-medium text-slate-600">
                  New password
                </span>
                <div className="mt-2 relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    className="block w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm pr-12 placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {password && (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-100 rounded overflow-hidden">
                      <div
                        className={`h-2 transition-all rounded ${
                          strength.score <= 1
                            ? "w-1/4 bg-red-400"
                            : strength.score <= 3
                            ? "w-2/4 bg-yellow-400"
                            : "w-11/12 bg-emerald-400"
                        }`}
                      />
                    </div>
                    <div className="text-xs text-slate-500 w-20 text-right">
                      {strength.label}
                    </div>
                  </div>
                )}
              </label>

              <label className="block relative">
                <span className="text-xs font-medium text-slate-600">
                  Confirm new password
                </span>
                <div className="mt-2 relative">
                  <input
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm password"
                    className="block w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm pr-12 placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm"
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
                {confirm && password !== confirm && (
                  <p className="text-xs text-red-600 mt-1">
                    Passwords do not match
                  </p>
                )}
              </label>

              <button
                type="submit"
                disabled={loading}
                className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg text-white text-sm font-semibold ${
                  loading
                    ? "bg-indigo-400 cursor-wait"
                    : "bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600"
                } shadow-md transition`}
              >
                {loading ? "Saving..." : "Save new password"}
              </button>
            </form>

            <div className="mt-4 text-sm">
              <button
                onClick={() => nav("/login")}
                className="text-slate-600 hover:underline"
              >
                Back to login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
