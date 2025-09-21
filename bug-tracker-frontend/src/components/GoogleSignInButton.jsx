// src/components/GoogleSignInButton.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authGoogle, setToken } from "../api";

/**
 * Robust Google Sign-In button:
 * - Dynamically loads GSI script if not present
 * - Waits for window.google to be ready, then initializes + renders button
 * - Provides a fallback manual button if GSI doesn't load
 */

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    // if already present, resolve immediately
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = (err) => reject(err);
    document.head.appendChild(s);
  });

export default function GoogleSignInButton({ onSuccess }) {
  const nav = useNavigate();
  const btnRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const initGSI = async () => {
      try {
        // load script if needed
        await loadScript("https://accounts.google.com/gsi/client");

        // wait a tick for window.google to be available
        const waitForGoogle = () =>
          new Promise((res, rej) => {
            const max = 20; // ~2s
            let i = 0;
            const t = setInterval(() => {
              i++;
              if (window.google) {
                clearInterval(t);
                return res();
              }
              if (i >= max) {
                clearInterval(t);
                return rej(new Error("Google script not available"));
              }
            }, 100);
          });

        await waitForGoogle();

        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId) {
          console.warn("VITE_GOOGLE_CLIENT_ID is not set");
          return;
        }

        // initialize
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              const idToken = response?.credential;
              if (!idToken) throw new Error("Google token missing");
              const res = await authGoogle({ idToken });
              // backend should return JWT token
              setToken(res.token);
              if (onSuccess) onSuccess(res);
              else nav("/");
            } catch (err) {
              console.error("Google sign-in failed", err);
              alert(err?.msg || "Google login failed");
            }
          },
          auto_select: false,
        });

        // render button into our container
        if (mounted && btnRef.current) {
          // clear container first
          btnRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(btnRef.current, {
            theme: "outline",
            size: "large",
            width: "250",
          });

          // optional: show one-tap prompt if you want
          // window.google.accounts.id.prompt();
          setReady(true);
        }
      } catch (err) {
        console.warn("Google Sign-In init failed:", err);
        // ready stays false -> fallback button will show
      }
    };

    initGSI();
    return () => {
      mounted = false;
    };
  }, [onSuccess, nav]);

  // Fallback manual button: useful if GSI fails or blocked
  const manualGoogle = () => {
    // If you support OAuth redirect flow, navigate to your backend endpoint
    // e.g. window.location.href = `${import.meta.env.VITE_API_URL || ""}/auth/google`;
    // Or open a popup flow as per your backend.
    window.location.href = "/auth/google"; // adjust if your flow differs
  };

  return (
    <div>
      <div ref={btnRef} id="g_id_button" />
      {!ready && (
        <div className="mt-3">
          <button
            onClick={manualGoogle}
            type="button"
            className="w-full inline-flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-gray-200 hover:shadow-sm transition"
          >
            Continue with Google
          </button>
        </div>
      )}
    </div>
  );
}
