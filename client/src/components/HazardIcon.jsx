import React from "react";

export default function HazardIcon({ type }) {
  const map = {
    FLOOD:      { emoji: "🌊", cls: "hz-bob" },
    FIRE:       { emoji: "🔥", cls: "hz-flicker" },
    CYCLONE:    { emoji: "🌀", cls: "hz-spin" },
    EARTHQUAKE: { emoji: "💥", cls: "hz-shake" },
    ACCIDENT:   { emoji: "🚑", cls: "hz-bounce" },
    OTHER:      { emoji: "🧰", cls: "hz-bounce" },
    default:    { emoji: "🛟", cls: "hz-bounce" },
  };
  const { emoji, cls } = map[type] || map.default;
  return <span className={`hazard-icon ${cls}`} title={type || "Type"}>{emoji}</span>;
}
