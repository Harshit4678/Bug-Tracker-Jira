// src/Verify.jsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Verify() {
  const loc = useLocation();
  const nav = useNavigate();
  const emailInit = loc.state?.email || "";

  const [email, setEmail] = useState(emailInit);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputsRef = useRef([]);

  const { verify, resend, loading, error, info } = useAuthStore();

  useEffect(() => {
    // cleanup not required here
  }, []);

  const focusInput = (idx) => {
    const el = inputsRef.current[idx];
    if (el) el.focus();
  };

  const handleOtpChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) {
      const next = [...otp];
      next[idx] = "";
      setOtp(next);
      return;
    }
    if (val.length > 1) {
      const chars = val.split("").slice(0, 6 - idx);
      const next = [...otp];
      for (let i = 0; i < chars.length; i++) next[idx + i] = chars[i];
      setOtp(next);
      const nextFocus = Math.min(idx + chars.length, 5);
      focusInput(nextFocus);
      return;
    }
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (idx < 5 && val) focusInput(idx + 1);
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) focusInput(idx - 1);
    if (e.key === "ArrowLeft" && idx > 0) focusInput(idx - 1);
    if (e.key === "ArrowRight" && idx < 5) focusInput(idx + 1);
  };

  const submit = async (e) => {
    e?.preventDefault();
    const code = otp.join("");
    if (!email) return;
    if (code.length !== 6) return;
    const ok = await verify(email, code);
    if (ok) {
      setTimeout(() => nav("/"), 300);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    await resend(email);
  };

  const pasteHandler = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    const next = Array(6).fill("");
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setOtp(next);
    const nextFocus = Math.min(text.length, 5);
    setTimeout(() => focusInput(nextFocus), 0);
    e.preventDefault();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-12">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="flex flex-col md:flex-row">
          <div className="order-1 md:order-2 w-full md:w-1/2 p-6 sm:p-8 lg:p-10">
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">
              Verify your email
            </h1>
            <p className="text-sm text-slate-500 mb-4">
              Enter the 6-digit code sent to your email.
            </p>

            {info && (
              <div
                className="mb-4 p-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700"
                role="status"
              >
                {info}
              </div>
            )}
            {error && (
              <div
                className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700"
                role="alert"
              >
                {error}
              </div>
            )}

            <form
              onSubmit={submit}
              className="space-y-4"
              onPaste={pasteHandler}
            >
              <div>
                <label className="text-xs text-slate-600">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="mt-2 block w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 placeholder:text-slate-400 text-slate-900"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 mb-2 block">
                  Verification code
                </label>
                <div className="flex gap-2 justify-center md:justify-start">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (inputsRef.current[i] = el)}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={digit}
                      onChange={(e) => handleOtpChange(e, i)}
                      onKeyDown={(e) => handleKeyDown(e, i)}
                      className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                      aria-label={`Digit ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg text-white text-sm font-semibold ${
                  loading
                    ? "bg-indigo-400 cursor-wait"
                    : "bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600"
                } shadow-md transition`}
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>
            </form>

            <div className="flex items-center justify-between mt-4 text-sm">
              <button
                onClick={handleResend}
                className="text-sm font-medium text-indigo-600 hover:underline"
              >
                Resend verification code
              </button>
              <button
                onClick={() => nav("/login")}
                className="text-sm text-slate-500 hover:underline"
              >
                Back to login
              </button>
            </div>
          </div>

          <div className="order-2 md:order-1 w-full md:w-1/2 bg-gradient-to-b from-white to-indigo-50 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-10">
            <img
              src="/logo.svg"
              alt="EnterSoft Bug Tracker"
              className="w-44 sm:w-56 md:w-64 lg:w-72"
            />
            <p className="mt-4 text-center text-sm text-slate-500 max-w-xs">
              We sent a verification code to{" "}
              <span className="font-medium text-slate-700">
                {email || "your email"}
              </span>
              . Paste or type the 6-digit code here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
