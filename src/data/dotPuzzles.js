// Each puzzle: { id, level, name, emoji, fillColor, dots:[{x,y}] }
// Dots listed in tap order. SVG viewBox: 0 0 200 200

export const DOT_PUZZLES = [
  // ── Level 1: simple shapes (3–4 dots) ───────────────────
  {
    id: "l1-triangle", level: 1, name: "Triangle", emoji: "🔺", fillColor: "#f97316",
    dots: [{ x: 100, y: 20 }, { x: 180, y: 170 }, { x: 20, y: 170 }],
  },
  {
    id: "l1-square", level: 1, name: "Square", emoji: "🟦", fillColor: "#3b82f6",
    dots: [{ x: 30, y: 30 }, { x: 170, y: 30 }, { x: 170, y: 170 }, { x: 30, y: 170 }],
  },
  {
    id: "l1-diamond", level: 1, name: "Diamond", emoji: "💎", fillColor: "#8b5cf6",
    dots: [{ x: 100, y: 20 }, { x: 180, y: 100 }, { x: 100, y: 180 }, { x: 20, y: 100 }],
  },

  // ── Level 2: medium shapes (5–10 dots) ──────────────────
  {
    id: "l2-house", level: 2, name: "House", emoji: "🏠", fillColor: "#ec4899",
    dots: [
      { x: 100, y: 20 }, { x: 170, y: 80 }, { x: 170, y: 170 },
      { x: 30, y: 170 }, { x: 30, y: 80 },
    ],
  },
  {
    id: "l2-star", level: 2, name: "Star", emoji: "⭐", fillColor: "#eab308",
    dots: [
      { x: 100, y: 15 }, { x: 120, y: 75 }, { x: 185, y: 75 },
      { x: 135, y: 115 }, { x: 155, y: 178 }, { x: 100, y: 140 },
      { x: 45, y: 178 }, { x: 65, y: 115 }, { x: 15, y: 75 }, { x: 80, y: 75 },
    ],
  },
  {
    id: "l2-heart", level: 2, name: "Heart", emoji: "❤️", fillColor: "#ef4444",
    dots: [
      { x: 100, y: 170 }, { x: 20, y: 80 }, { x: 20, y: 50 },
      { x: 50, y: 25 }, { x: 100, y: 60 }, { x: 150, y: 25 },
      { x: 180, y: 50 }, { x: 180, y: 80 },
    ],
  },

  // ── Level 3: harder shapes (8–11 dots) ──────────────────
  {
    id: "l3-rocket", level: 3, name: "Rocket", emoji: "🚀", fillColor: "#06b6d4",
    dots: [
      { x: 100, y: 15 }, { x: 145, y: 70 }, { x: 145, y: 145 },
      { x: 165, y: 175 }, { x: 100, y: 155 }, { x: 35, y: 175 },
      { x: 55, y: 145 }, { x: 55, y: 70 },
    ],
  },
  {
    id: "l3-fish", level: 3, name: "Fish", emoji: "🐟", fillColor: "#22c55e",
    dots: [
      { x: 160, y: 100 }, { x: 185, y: 60 }, { x: 185, y: 140 },
      { x: 130, y: 100 }, { x: 100, y: 65 }, { x: 40, y: 60 },
      { x: 20, y: 100 }, { x: 40, y: 140 }, { x: 100, y: 135 },
    ],
  },
  {
    id: "l3-tree", level: 3, name: "Tree", emoji: "🌲", fillColor: "#16a34a",
    dots: [
      { x: 100, y: 10 }, { x: 155, y: 70 }, { x: 130, y: 70 },
      { x: 165, y: 125 }, { x: 120, y: 125 }, { x: 120, y: 185 },
      { x: 80, y: 185 }, { x: 80, y: 125 }, { x: 35, y: 125 },
      { x: 70, y: 70 }, { x: 45, y: 70 },
    ],
  },

  // ── Level 4: complex shapes (7–16 dots) ─────────────────
  {
    id: "l4-butterfly", level: 4, name: "Butterfly", emoji: "🦋", fillColor: "#a855f7",
    dots: [
      { x: 100, y: 100 }, { x: 60, y: 60 }, { x: 20, y: 30 },
      { x: 15, y: 80 }, { x: 40, y: 120 }, { x: 80, y: 130 },
      { x: 100, y: 170 }, { x: 120, y: 130 }, { x: 160, y: 120 },
      { x: 185, y: 80 }, { x: 180, y: 30 }, { x: 140, y: 60 },
    ],
  },
  {
    id: "l4-crown", level: 4, name: "Crown", emoji: "👑", fillColor: "#f59e0b",
    dots: [
      { x: 20, y: 170 }, { x: 20, y: 80 }, { x: 55, y: 130 },
      { x: 100, y: 40 }, { x: 145, y: 130 }, { x: 180, y: 80 }, { x: 180, y: 170 },
    ],
  },
  {
    id: "l4-car", level: 4, name: "Car", emoji: "🚗", fillColor: "#dc2626",
    dots: [
      { x: 20, y: 140 }, { x: 20, y: 110 }, { x: 50, y: 110 },
      { x: 70, y: 70 }, { x: 130, y: 70 }, { x: 150, y: 110 },
      { x: 180, y: 110 }, { x: 180, y: 140 }, { x: 150, y: 140 },
      { x: 145, y: 155 }, { x: 115, y: 155 }, { x: 110, y: 140 },
      { x: 90, y: 140 }, { x: 85, y: 155 }, { x: 55, y: 155 }, { x: 50, y: 140 },
    ],
  },
];

export const LEVELS = [1, 2, 3, 4];

export function getPuzzlesForLevel(level) {
  return DOT_PUZZLES.filter((p) => p.level === level);
}
