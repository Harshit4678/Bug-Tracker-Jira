// src/api.js
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getToken = () => localStorage.getItem("token");
export const setToken = (t) => localStorage.setItem("token", t);
export const removeToken = () => localStorage.removeItem("token");

async function request(path, opts = {}) {
  const headers = opts.headers || {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  headers["Content-Type"] = headers["Content-Type"] || "application/json";

  const res = await fetch(API + path, { ...opts, headers }); // <- fixed spread syntax
  const data = await res.json().catch(() => null);
  if (!res.ok) throw data || { msg: "Network error" };
  return data;
}

export const authRegister = (body) =>
  request("/auth/register", { method: "POST", body: JSON.stringify(body) });
export const authVerify = (body) =>
  request("/auth/verify", { method: "POST", body: JSON.stringify(body) });
export const authForgot = (body) =>
  request("/auth/forgot", { method: "POST", body: JSON.stringify(body) });
export const authVerifyResetCode = (body) =>
  request("/auth/verify-reset-code", {
    method: "POST",
    body: JSON.stringify(body),
  }); // NEW
export const authReset = (body) =>
  request("/auth/reset", { method: "POST", body: JSON.stringify(body) });
export const authResend = (body) =>
  request("/auth/resend", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const authLogin = (body) =>
  request("/auth/login", { method: "POST", body: JSON.stringify(body) });

export const createBug = (body) =>
  request("/bugs", { method: "POST", body: JSON.stringify(body) });
export const fetchBugs = (query = "") =>
  request("/bugs" + (query ? `?${query}` : ""));
export const updateBug = (id, body) =>
  request(`/bugs/${id}`, { method: "PUT", body: JSON.stringify(body) });

export const authGoogle = (body) =>
  request("/auth/google", { method: "POST", body: JSON.stringify(body) });
