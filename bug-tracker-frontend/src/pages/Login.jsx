// src/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../store/authStore";
import GoogleSignInButton from "../components/GoogleSignInButton";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const { login, loading, error, info } = useAuthStore();

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    const ok = await login(email.toLowerCase(), password);
    if (ok) nav("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-12">
      <div className="w-full max-w-4xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-white to-indigo-50">
            <img
              src="/logo.svg"
              alt="EnterSoft Bug Tracker"
              className="w-full max-w-xs  lg:max-w-md"
            />
            <p className="mt-4 text-sm md:text-base text-slate-500 text-center max-w-xs">
              Track, update & collaborate effortlessly
            </p>
          </div>

          <div className="w-full md:w-1/2 p-8 md:p-12">
            <div className="flex items-center justify-end mb-4">
              <div className="text-sm text-slate-500">
                New?{" "}
                <Link
                  to="/register"
                  className="text-indigo-600 font-medium hover:underline"
                >
                  Create account
                </Link>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-6">
              Login
            </h1>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
                {error}
              </div>
            )}
            {info && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700">
                {info}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <input
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                type="email"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
              />
              <input
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
              />

              <button
                type="submit"
                disabled={loading}
                className={`w-full inline-flex items-center justify-center gap-3 py-3 rounded-xl text-white text-sm font-semibold ${
                  loading
                    ? "bg-indigo-400 cursor-wait"
                    : "bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600"
                } shadow-md transition`}
              >
                {loading ? (
                  <svg
                    className="h-5 w-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-25"
                    />
                    <path
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      fill="currentColor"
                      className="opacity-75"
                    />
                  </svg>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <div className="flex items-center justify-between mt-4 text-sm">
              <Link to="/forgot" className="text-indigo-600 hover:underline">
                Forgot password?
              </Link>
              <span className="text-xs text-gray-500">
                No account?{" "}
                <Link
                  to="/register"
                  className="text-indigo-600 hover:underline"
                >
                  Register
                </Link>
              </span>
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-3">
                <div className="h-px bg-gray-200 flex-1"></div>
                <div className="text-xs text-slate-400">Or continue with</div>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>

              <div className="mt-4">
                <GoogleSignInButton className="w-full inline-flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:shadow-sm transition" />
              </div>
            </div>

            <div className="mt-6 text-xs text-slate-400">
              Need help?{" "}
              <a
                href="mailto:Harshitkumar2045@gmail.com?subject=Support%20Request&body=Hi%20there,"
                className="text-indigo-600 hover:underline"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
