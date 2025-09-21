import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { getToken } from "./api";
import Verify from "./pages/Verify";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import FooterBottom from "./components/FooterBottom";

const Private = ({ children }) =>
  getToken() ? children : <Navigate to="/login" />;

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <Private>
                <Dashboard />
              </Private>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </div>

      {/* 👇 bottom part */}

      <FooterBottom />
    </div>
  );
}
