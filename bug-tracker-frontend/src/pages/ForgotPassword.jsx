// src/ForgotPassword.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function ForgotPassword() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [step, setStep] = useState("email"); // "email" or "otp"
  const [code, setCode] = useState("");
  const [resendLeft, setResendLeft] = useState(0);
  const timerRef = useRef(null);

  const { forgot, verifyResetCode, loading, error, info } = useAuthStore();

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const startCooldown = (secs = 30) => {
    setResendLeft(secs);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const sendOtp = async (e) => {
    e?.preventDefault();
    if (!email) return;
    const ok = await forgot(email.toLowerCase());
    if (ok) {
      setStep("otp");
      startCooldown(30);
    }
  };

  const resend = async () => {
    if (!email) return;
    const ok = await forgot(email.toLowerCase());
    if (ok) {
      startCooldown(30);
    }
  };

  const verifyOtp = async (e) => {
    e?.preventDefault();
    if (!email || !code) return;
    const resetToken = await verifyResetCode(email.toLowerCase(), code);
    if (resetToken) {
      nav("/reset-password", {
        state: { email: email.toLowerCase(), resetToken },
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-12">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="flex flex-col md:flex-row">
          <div className="order-1 md:order-2 w-full md:w-1/2 p-6 sm:p-8 lg:p-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
                {step === "email" ? "Reset Password" : "Verify OTP"}
              </h2>
            </div>

            {info && (
              <div
                className="mb-4 p-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700"
                role="status"
                aria-live="polite"
              >
                {info}
              </div>
            )}
            {error && (
              <div
                className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            )}

            {step === "email" ? (
              <form onSubmit={sendOtp} className="space-y-4">
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">
                    Email
                  </span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    type="email"
                    className="mt-2 block w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                  />
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
                  {loading ? "Sending..." : "Send OTP"}
                </button>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => nav("/login")}
                    className="text-sm text-slate-500 hover:underline"
                  >
                    Back to login
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={verifyOtp} className="space-y-4">
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">
                    Email
                  </span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className="mt-2 block w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-slate-600">
                    Enter OTP
                  </span>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="One-time code"
                    className="mt-2 block w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg text-white text-sm font-semibold ${
                    loading
                      ? "bg-indigo-400 cursor-wait"
                      : "bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                  } shadow-md transition`}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={resend}
                    disabled={resendLeft > 0}
                    className={`text-sm font-medium ${
                      resendLeft > 0
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-indigo-600 hover:underline"
                    }`}
                  >
                    {resendLeft > 0
                      ? `Resend OTP (${resendLeft}s)`
                      : "Resend OTP"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setCode("");
                    }}
                    className="text-sm text-slate-500 hover:underline"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="order-2 md:order-1 w-full md:w-1/2 bg-gradient-to-b from-white to-indigo-50 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-10">
            <img
              src="/logo.svg"
              alt="EnterSoft Bug Tracker"
              className="w-44 sm:w-56 md:w-64 lg:w-72"
            />
            <p className="mt-4 text-center text-sm text-slate-500 max-w-xs">
              Securely reset your password — OTP will be sent to your email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
