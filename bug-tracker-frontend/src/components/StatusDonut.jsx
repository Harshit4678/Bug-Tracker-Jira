// src/components/StatusDonut.jsx
import React from "react";

function polarToCartesian(cx, cy, r, angle) {
  const a = ((angle - 90) * Math.PI) / 180.0;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

export default function StatusDonut({
  counts = { Open: 0, "In Progress": 0, Closed: 0 },
  size = 120,
}) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const angles = [
    { key: "Open", value: counts.Open || 0, color: "#2563EB" }, // blue
    { key: "In Progress", value: counts["In Progress"] || 0, color: "#6366F1" }, // indigo
    { key: "Closed", value: counts.Closed || 0, color: "#6B7280" }, // gray
  ];
  let start = 0;
  const cx = size / 2,
    cy = size / 2,
    r = size / 2 - 10;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#f3f4f6"
        strokeWidth="12"
      />
      {angles.map((seg) => {
        const angle = (seg.value / total) * 360;
        const path = describeArc(cx, cy, r, start, start + angle);
        const strokeWidth = 12;
        const element = (
          <path
            key={seg.key}
            d={path}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        );
        start += angle;
        return element;
      })}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-sm"
        fontSize="12"
        fill="#374151"
      >
        {total}
      </text>
    </svg>
  );
}
