// src/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../store/authStore";
import GoogleSignInButton from "../components/GoogleSignInButton";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const { register, loading, error, info } = useAuthStore();

  const submit = async (e) => {
    e.preventDefault();
    setName((s) => s);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name.trim() || !emailRegex.test(email)) return;
    if (password.length < 6) return;

    const ok = await register(name.trim(), email.toLowerCase(), password);
    if (ok) nav("/verify", { state: { email: email.toLowerCase() } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-10">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="flex flex-col md:flex-row">
          <div className="order-1 md:order-2 w-full md:w-1/2 p-6 sm:p-8 lg:p-10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-slate-500">
                Already have an account?
              </div>
              <Link
                to="/login"
                className="text-indigo-600 font-medium hover:underline text-sm"
              >
                Sign in
              </Link>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-4">
              Create account
            </h1>

            {error && (
              <div
                className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700"
                role="alert"
              >
                {error}
              </div>
            )}
            {info && (
              <div
                className="mb-4 p-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700"
                role="status"
              >
                {info}
              </div>
            )}

            <form onSubmit={submit} className="space-y-3 sm:space-y-4">
              <label className="block">
                <span className="text-xs font-medium text-slate-600">
                  Full name
                </span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="mt-2 block w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg shadow-sm placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-slate-600">
                  Email
                </span>
                <input
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  type="email"
                  className="mt-2 block w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg shadow-sm placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                />
              </label>

              <label className="block">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">
                    Password
                  </span>
                  <span className="text-xs text-slate-400">
                    Min 6 characters
                  </span>
                </div>
                <input
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  type="password"
                  className="mt-2 block w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg shadow-sm placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className={`w-full inline-flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-lg text-white text-sm sm:text-base font-semibold ${
                  loading
                    ? "bg-indigo-400 cursor-wait"
                    : "bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600"
                } shadow-md transition`}
              >
                {loading ? "Creating..." : "Create account"}
              </button>
            </form>

            <div className="mt-5">
              <div className="flex items-center gap-2">
                <div className="h-px bg-gray-200 flex-1"></div>
                <div className="text-xs text-slate-400">Or continue with</div>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3">
                <GoogleSignInButton
                  className="w-full inline-flex items-center justify-center gap-3 px-4 py-2.5 sm:py-3 rounded-lg border border-gray-200 hover:shadow-sm transition"
                  onSuccess={() => {
                    nav("/");
                  }}
                />
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-400">
              By creating an account you agree to our{" "}
              <Link to="/terms" className="underline text-indigo-600">
                Terms
              </Link>
              .
            </div>
          </div>

          <div className="order-2 md:order-1 w-full md:w-1/2 bg-gradient-to-b from-white to-indigo-50 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-10">
            <img
              src="/logo.svg"
              alt="EnterSoft Bug Tracker"
              className="w-44 sm:w-96"
            />
            <p className="mt-3 text-center text-sm sm:text-base text-slate-500 max-w-xs">
              Track, update & collaborate effortlessly
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-sm">
              <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                <div className="h-8 w-8 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold">
                  ✓
                </div>
                <div className="text-xs">
                  <div className="font-medium text-slate-700">Fast OTP</div>
                  <div className="text-slate-400">Email verification</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                <div className="h-8 w-8 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold">
                  🔒
                </div>
                <div className="text-xs">
                  <div className="font-medium text-slate-700">Secure</div>
                  <div className="text-slate-400">Encrypted credentials</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
