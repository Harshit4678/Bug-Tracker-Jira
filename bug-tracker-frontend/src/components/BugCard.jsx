// src/components/BugCard.jsx
import React from "react";

const severityColor = {
  Low: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-red-100 text-red-800",
};

const statusColor = {
  Open: "bg-blue-50 text-blue-700",
  "In Progress": "bg-indigo-50 text-indigo-700",
  Closed: "bg-gray-100 text-gray-700",
};

export default function BugCard({ bug, onChangeStatus, canEdit }) {
  return (
    <div className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <div className="flex items-start justify-between">
          <h4 className="text-lg font-semibold">{bug.title}</h4>
          <div
            className={`text-sm font-medium px-2 py-0.5 rounded-full ${
              severityColor[bug.severity] || "bg-gray-100"
            }`}
          >
            {bug.severity}
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600">{bug.description}</p>

        <div className="mt-3 text-xs text-gray-500 flex flex-wrap gap-3 items-center">
          <span>
            By{" "}
            <span className="font-medium text-gray-700">
              {bug.createdBy?.name || "Unknown"}
            </span>
          </span>
          <span>•</span>
          <span>
            {new Date(
              bug.createdAt || bug.updatedAt || Date.now()
            ).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-start md:items-end gap-3">
        <div
          className={`text-sm px-3 py-1 rounded-full ${
            statusColor[bug.status] || "bg-gray-100"
          }`}
        >
          {bug.status}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onChangeStatus(bug._id, "Open")}
            disabled={!canEdit}
            className={`px-3 py-1 text-sm rounded ${
              canEdit
                ? "border hover:bg-gray-50"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            Open
          </button>
          <button
            onClick={() => onChangeStatus(bug._id, "In Progress")}
            disabled={!canEdit}
            className={`px-3 py-1 text-sm rounded ${
              canEdit
                ? "border hover:bg-gray-50"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => onChangeStatus(bug._id, "Closed")}
            disabled={!canEdit}
            className={`px-3 py-1 text-sm rounded ${
              canEdit
                ? "border hover:bg-gray-50"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            Closed
          </button>
        </div>
      </div>
    </div>
  );
}
