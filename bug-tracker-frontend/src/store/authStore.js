// src/store/authStore.js
import { create } from "zustand";
import {
  authLogin,
  authRegister,
  authVerify,
  authForgot,
  authVerifyResetCode,
  authReset,
  authResend,
  setToken,
  removeToken,
} from "../api";

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  info: null,

  // LOGIN
  login: async (email, password) => {
    set({ loading: true, error: null, info: null });
    try {
      const res = await authLogin({ email, password });
      if (res?.token) setToken(res.token);
      set({
        user: res?.user || null,
        token: res?.token || null,
        info: "Login successful",
      });
      return true;
    } catch (err) {
      const msg =
        err?.msg || err?.message || err?.response?.data?.msg || "Login failed";
      set({ error: msg });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // REGISTER
  register: async (name, email, password) => {
    set({ loading: true, error: null, info: null });
    try {
      await authRegister({ name, email, password });
      set({ info: "Verification code sent to your email" });
      return true;
    } catch (err) {
      const msg =
        err?.msg ||
        err?.message ||
        err?.response?.data?.msg ||
        "Register failed";
      set({ error: msg });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // VERIFY (signup)
  verify: async (email, code) => {
    set({ loading: true, error: null, info: null });
    try {
      const res = await authVerify({ email, code });
      if (res?.token) setToken(res.token);
      set({
        token: res?.token || null,
        user: res?.user || null,
        info: "Verified",
      });
      return true;
    } catch (err) {
      const msg =
        err?.msg ||
        err?.message ||
        err?.response?.data?.msg ||
        "Verification failed";
      set({ error: msg });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // FORGOT (send OTP)
  forgot: async (email) => {
    set({ loading: true, error: null, info: null });
    try {
      await authForgot({ email });
      set({ info: "OTP sent to your email" });
      return true;
    } catch (err) {
      const msg =
        err?.msg ||
        err?.message ||
        err?.response?.data?.msg ||
        "Failed to send OTP";
      set({ error: msg });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // VERIFY RESET CODE -> returns resetToken
  verifyResetCode: async (email, code) => {
    set({ loading: true, error: null, info: null });
    try {
      const res = await authVerifyResetCode({ email, code });
      set({ info: "OTP verified" });
      return res?.resetToken || null;
    } catch (err) {
      const msg =
        err?.msg ||
        err?.message ||
        err?.response?.data?.msg ||
        "OTP verification failed";
      set({ error: msg });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // RESET PASSWORD
  resetPassword: async (email, password, resetToken) => {
    set({ loading: true, error: null, info: null });
    try {
      const payload = { email, password };
      if (resetToken) payload.resetToken = resetToken;
      await authReset(payload);
      set({ info: "Password reset successful" });
      return true;
    } catch (err) {
      const msg =
        err?.msg || err?.message || err?.response?.data?.msg || "Reset failed";
      set({ error: msg });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // RESEND CODE
  resend: async (email) => {
    set({ error: null, info: null, loading: true });
    try {
      await authResend({ email });
      set({ info: "Verification code resent" });
    } catch (err) {
      const msg =
        err?.msg || err?.message || err?.response?.data?.msg || "Resend failed";
      set({ error: msg });
    } finally {
      set({ loading: false });
    }
  },

  // LOGOUT
  logout: () => {
    removeToken();
    set({ user: null, token: null, info: null, error: null });
  },
}));

export default useAuthStore;
