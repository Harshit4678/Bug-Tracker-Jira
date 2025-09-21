// src/components/ActivityFeed.jsx
import React from "react";

export default function ActivityFeed({ activities = [] }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <h3 className="text-sm font-medium mb-3">Recent activity</h3>
      <div className="space-y-3">
        {activities.length === 0 && (
          <div className="text-sm text-gray-500">No recent actions</div>
        )}
        {activities.map((a) => (
          <div key={a._id || a.id} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm text-gray-600">
              {a.actorName ? a.actorName.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex-1">
              <div className="text-sm">
                <span className="font-medium">{a.actorName || "Someone"}</span>
                <span className="text-gray-500"> {a.action} </span>
                <span className="text-gray-600 font-medium">
                  "{a.targetTitle || a.target || ""}"
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(a.at || a.createdAt || Date.now()).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
