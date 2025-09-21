// src/components/KpiCard.jsx
import React from "react";

export default function KpiCard({ title, value, delta, icon }) {
  return (
    <div className="p-4 rounded-2xl shadow-sm bg-white/80 backdrop-blur-sm border border-gray-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-gray-400">{title}</div>
          <div className="mt-2 flex items-baseline gap-3">
            <div className="text-2xl font-bold">{value}</div>
            {delta !== undefined && (
              <div
                className={`text-sm ${
                  delta >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {delta >= 0 ? "+" : ""}
                {delta}
              </div>
            )}
          </div>
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
