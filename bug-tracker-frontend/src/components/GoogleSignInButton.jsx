import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authGoogle, setToken } from "../api";

export default function GoogleSignInButton({ onSuccess }) {
  const nav = useNavigate();

  useEffect(() => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
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

    window.google.accounts.id.renderButton(
      document.getElementById("g_id_button"),
      {
        theme: "outline",
        size: "large",
        width: "250",
      }
    );
  }, []);

  return <div id="g_id_button"></div>;
}
