// SVG viewBox 0 0 200 200
// Each stroke = array of {x,y} waypoints to trace through in order
// Multi-stroke chars: kid completes each stroke sequentially

const LETTER_COLORS = [
  "#FF6B6B",
  "#FF8E53",
  "#FFC300",
  "#2ECC71",
  "#1ABC9C",
  "#3498DB",
  "#9B59B6",
  "#E91E63",
  "#00BCD4",
  "#8BC34A",
  "#FF5722",
  "#607D8B",
  "#F06292",
  "#4DB6AC",
  "#FFB74D",
  "#7986CB",
  "#A1887F",
  "#4CAF50",
  "#26C6DA",
  "#EC407A",
  "#66BB6A",
  "#FFA726",
  "#AB47BC",
  "#29B6F6",
  "#D4E157",
  "#EF5350",
];

const NUMBER_COLORS = [
  "#FF6B6B",
  "#FF8E53",
  "#FFC300",
  "#2ECC71",
  "#1ABC9C",
  "#3498DB",
  "#9B59B6",
  "#E91E63",
  "#00BCD4",
  "#8BC34A",
];

export const WRITE_CHARS = [
  // --- LETTERS ---
  {
    id: "A",
    label: "A",
    type: "letter",
    color: LETTER_COLORS[0],
    strokes: [
      // Inverted-V: bottom-left → apex → bottom-right
      [
        { x: 30, y: 180 },
        { x: 65, y: 115 },
        { x: 100, y: 20 },
        { x: 135, y: 115 },
        { x: 170, y: 180 },
      ],
      // Crossbar
      [
        { x: 60, y: 118 },
        { x: 100, y: 118 },
        { x: 140, y: 118 },
      ],
    ],
  },
  {
    id: "B",
    label: "B",
    type: "letter",
    color: LETTER_COLORS[1],
    strokes: [
      [
        { x: 50, y: 20 },
        { x: 50, y: 180 },
      ],
      [
        { x: 50, y: 20 },
        { x: 120, y: 20 },
        { x: 148, y: 45 },
        { x: 120, y: 100 },
        { x: 50, y: 100 },
        { x: 132, y: 148 },
        { x: 148, y: 165 },
        { x: 120, y: 180 },
        { x: 50, y: 180 },
      ],
    ],
  },
  {
    id: "C",
    label: "C",
    type: "letter",
    color: LETTER_COLORS[2],
    strokes: [
      [
        { x: 155, y: 55 },
        { x: 115, y: 25 },
        { x: 70, y: 30 },
        { x: 35, y: 70 },
        { x: 35, y: 130 },
        { x: 70, y: 170 },
        { x: 115, y: 175 },
        { x: 155, y: 148 },
      ],
    ],
  },
  {
    id: "D",
    label: "D",
    type: "letter",
    color: LETTER_COLORS[3],
    strokes: [
      [
        { x: 50, y: 20 },
        { x: 50, y: 180 },
        { x: 110, y: 180 },
        { x: 155, y: 140 },
        { x: 155, y: 60 },
        { x: 110, y: 20 },
        { x: 50, y: 20 },
      ],
    ],
  },
  {
    id: "E",
    label: "E",
    type: "letter",
    color: LETTER_COLORS[4],
    strokes: [
      // Outer frame: top-right → top-left → down → bottom-right
      [
        { x: 145, y: 20 },
        { x: 45, y: 20 },
        { x: 45, y: 100 },
        { x: 45, y: 180 },
        { x: 145, y: 180 },
      ],
      // Middle arm
      [
        { x: 45, y: 100 },
        { x: 100, y: 100 },
        { x: 125, y: 100 },
      ],
    ],
  },
  {
    id: "F",
    label: "F",
    type: "letter",
    color: LETTER_COLORS[5],
    strokes: [
      // Top-right → top-left → down the full spine
      [
        { x: 145, y: 20 },
        { x: 45, y: 20 },
        { x: 45, y: 100 },
        { x: 45, y: 180 },
      ],
      // Middle arm
      [
        { x: 45, y: 100 },
        { x: 100, y: 100 },
        { x: 125, y: 100 },
      ],
    ],
  },
  {
    id: "G",
    label: "G",
    type: "letter",
    color: LETTER_COLORS[6],
    strokes: [
      [
        { x: 155, y: 55 },
        { x: 115, y: 25 },
        { x: 70, y: 30 },
        { x: 35, y: 70 },
        { x: 35, y: 130 },
        { x: 70, y: 170 },
        { x: 115, y: 175 },
        { x: 155, y: 148 },
        { x: 155, y: 110 },
        { x: 110, y: 110 },
      ],
    ],
  },
  {
    id: "H",
    label: "H",
    type: "letter",
    color: LETTER_COLORS[7],
    strokes: [
      [
        { x: 40, y: 20 },
        { x: 40, y: 180 },
      ],
      [
        { x: 160, y: 20 },
        { x: 160, y: 180 },
      ],
      [
        { x: 40, y: 100 },
        { x: 160, y: 100 },
      ],
    ],
  },
  {
    id: "I",
    label: "I",
    type: "letter",
    color: LETTER_COLORS[8],
    strokes: [
      [
        { x: 70, y: 20 },
        { x: 130, y: 20 },
      ],
      [
        { x: 100, y: 20 },
        { x: 100, y: 180 },
      ],
      [
        { x: 70, y: 180 },
        { x: 130, y: 180 },
      ],
    ],
  },
  {
    id: "J",
    label: "J",
    type: "letter",
    color: LETTER_COLORS[9],
    strokes: [
      [
        { x: 80, y: 20 },
        { x: 140, y: 20 },
      ],
      [
        { x: 120, y: 20 },
        { x: 120, y: 150 },
        { x: 100, y: 175 },
        { x: 70, y: 175 },
        { x: 50, y: 155 },
      ],
    ],
  },
  {
    id: "K",
    label: "K",
    type: "letter",
    color: LETTER_COLORS[10],
    strokes: [
      // Spine
      [
        { x: 45, y: 20 },
        { x: 45, y: 100 },
        { x: 45, y: 180 },
      ],
      // Upper diagonal: top-right → mid-spine
      [
        { x: 155, y: 20 },
        { x: 100, y: 60 },
        { x: 45, y: 100 },
      ],
      // Lower diagonal: mid-spine → bottom-right
      [
        { x: 45, y: 100 },
        { x: 100, y: 140 },
        { x: 155, y: 180 },
      ],
    ],
  },
  {
    id: "L",
    label: "L",
    type: "letter",
    color: LETTER_COLORS[11],
    strokes: [
      [
        { x: 55, y: 20 },
        { x: 55, y: 180 },
        { x: 155, y: 180 },
      ],
    ],
  },
  {
    id: "M",
    label: "M",
    type: "letter",
    color: LETTER_COLORS[12],
    strokes: [
      [
        { x: 30, y: 180 },
        { x: 30, y: 20 },
        { x: 100, y: 100 },
        { x: 170, y: 20 },
        { x: 170, y: 180 },
      ],
    ],
  },
  {
    id: "N",
    label: "N",
    type: "letter",
    color: LETTER_COLORS[13],
    strokes: [
      [
        { x: 40, y: 180 },
        { x: 40, y: 20 },
        { x: 160, y: 180 },
        { x: 160, y: 20 },
      ],
    ],
  },
  {
    id: "O",
    label: "O",
    type: "letter",
    color: LETTER_COLORS[14],
    strokes: [
      [
        { x: 100, y: 20 },
        { x: 50, y: 45 },
        { x: 30, y: 100 },
        { x: 50, y: 155 },
        { x: 100, y: 180 },
        { x: 150, y: 155 },
        { x: 170, y: 100 },
        { x: 150, y: 45 },
        { x: 100, y: 20 },
      ],
    ],
  },
  {
    id: "P",
    label: "P",
    type: "letter",
    color: LETTER_COLORS[15],
    strokes: [
      [
        { x: 50, y: 180 },
        { x: 50, y: 20 },
        { x: 130, y: 20 },
        { x: 155, y: 45 },
        { x: 130, y: 100 },
        { x: 50, y: 100 },
      ],
    ],
  },
  {
    id: "Q",
    label: "Q",
    type: "letter",
    color: LETTER_COLORS[16],
    strokes: [
      [
        { x: 100, y: 20 },
        { x: 50, y: 45 },
        { x: 30, y: 100 },
        { x: 50, y: 155 },
        { x: 100, y: 180 },
        { x: 150, y: 155 },
        { x: 170, y: 100 },
        { x: 150, y: 45 },
        { x: 100, y: 20 },
      ],
      [
        { x: 120, y: 145 },
        { x: 160, y: 180 },
      ],
    ],
  },
  {
    id: "R",
    label: "R",
    type: "letter",
    color: LETTER_COLORS[17],
    strokes: [
      // P-shape: up the spine, around the bump, back to mid-spine
      [
        { x: 50, y: 180 },
        { x: 50, y: 100 },
        { x: 50, y: 20 },
        { x: 130, y: 20 },
        { x: 155, y: 45 },
        { x: 130, y: 100 },
        { x: 50, y: 100 },
      ],
      // Leg: diagonal down-right
      [
        { x: 50, y: 100 },
        { x: 100, y: 140 },
        { x: 155, y: 180 },
      ],
    ],
  },
  {
    id: "S",
    label: "S",
    type: "letter",
    color: LETTER_COLORS[18],
    strokes: [
      [
        { x: 155, y: 45 },
        { x: 115, y: 20 },
        { x: 65, y: 25 },
        { x: 40, y: 60 },
        { x: 65, y: 95 },
        { x: 135, y: 105 },
        { x: 160, y: 140 },
        { x: 135, y: 175 },
        { x: 85, y: 180 },
        { x: 45, y: 155 },
      ],
    ],
  },
  {
    id: "T",
    label: "T",
    type: "letter",
    color: LETTER_COLORS[19],
    strokes: [
      [
        { x: 30, y: 20 },
        { x: 170, y: 20 },
      ],
      [
        { x: 100, y: 20 },
        { x: 100, y: 180 },
      ],
    ],
  },
  {
    id: "U",
    label: "U",
    type: "letter",
    color: LETTER_COLORS[20],
    strokes: [
      [
        { x: 40, y: 20 },
        { x: 40, y: 140 },
        { x: 55, y: 168 },
        { x: 100, y: 180 },
        { x: 145, y: 168 },
        { x: 160, y: 140 },
        { x: 160, y: 20 },
      ],
    ],
  },
  {
    id: "V",
    label: "V",
    type: "letter",
    color: LETTER_COLORS[21],
    strokes: [
      [
        { x: 30, y: 20 },
        { x: 100, y: 180 },
        { x: 170, y: 20 },
      ],
    ],
  },
  {
    id: "W",
    label: "W",
    type: "letter",
    color: LETTER_COLORS[22],
    strokes: [
      [
        { x: 20, y: 20 },
        { x: 60, y: 180 },
        { x: 100, y: 100 },
        { x: 140, y: 180 },
        { x: 180, y: 20 },
      ],
    ],
  },
  {
    id: "X",
    label: "X",
    type: "letter",
    color: LETTER_COLORS[23],
    strokes: [
      [
        { x: 35, y: 20 },
        { x: 165, y: 180 },
      ],
      [
        { x: 165, y: 20 },
        { x: 35, y: 180 },
      ],
    ],
  },
  {
    id: "Y",
    label: "Y",
    type: "letter",
    color: LETTER_COLORS[24],
    strokes: [
      [
        { x: 30, y: 20 },
        { x: 100, y: 100 },
        { x: 170, y: 20 },
      ],
      [
        { x: 100, y: 100 },
        { x: 100, y: 180 },
      ],
    ],
  },
  {
    id: "Z",
    label: "Z",
    type: "letter",
    color: LETTER_COLORS[25],
    strokes: [
      [
        { x: 35, y: 20 },
        { x: 165, y: 20 },
        { x: 35, y: 180 },
        { x: 165, y: 180 },
      ],
    ],
  },

  // --- NUMBERS ---
  {
    id: "0",
    label: "0",
    type: "number",
    color: NUMBER_COLORS[0],
    strokes: [
      [
        { x: 100, y: 20 },
        { x: 50, y: 45 },
        { x: 30, y: 100 },
        { x: 50, y: 155 },
        { x: 100, y: 180 },
        { x: 150, y: 155 },
        { x: 170, y: 100 },
        { x: 150, y: 45 },
        { x: 100, y: 20 },
      ],
    ],
  },
  {
    id: "1",
    label: "1",
    type: "number",
    color: NUMBER_COLORS[1],
    strokes: [
      [
        { x: 70, y: 55 },
        { x: 100, y: 20 },
        { x: 100, y: 180 },
      ],
      [
        { x: 65, y: 180 },
        { x: 135, y: 180 },
      ],
    ],
  },
  {
    id: "2",
    label: "2",
    type: "number",
    color: NUMBER_COLORS[2],
    strokes: [
      [
        { x: 45, y: 55 },
        { x: 65, y: 25 },
        { x: 120, y: 20 },
        { x: 155, y: 55 },
        { x: 120, y: 95 },
        { x: 40, y: 180 },
        { x: 160, y: 180 },
      ],
    ],
  },
  {
    id: "3",
    label: "3",
    type: "number",
    color: NUMBER_COLORS[3],
    strokes: [
      [
        { x: 45, y: 30 },
        { x: 100, y: 20 },
        { x: 150, y: 50 },
        { x: 105, y: 100 },
        { x: 150, y: 150 },
        { x: 100, y: 180 },
        { x: 45, y: 170 },
      ],
    ],
  },
  {
    id: "4",
    label: "4",
    type: "number",
    color: NUMBER_COLORS[4],
    strokes: [
      [
        { x: 130, y: 180 },
        { x: 130, y: 20 },
        { x: 30, y: 130 },
        { x: 165, y: 130 },
      ],
    ],
  },
  {
    id: "5",
    label: "5",
    type: "number",
    color: NUMBER_COLORS[5],
    strokes: [
      [
        { x: 155, y: 20 },
        { x: 50, y: 20 },
        { x: 50, y: 95 },
        { x: 120, y: 90 },
        { x: 158, y: 125 },
        { x: 130, y: 175 },
        { x: 70, y: 180 },
        { x: 40, y: 155 },
      ],
    ],
  },
  {
    id: "6",
    label: "6",
    type: "number",
    color: NUMBER_COLORS[6],
    strokes: [
      [
        { x: 150, y: 40 },
        { x: 100, y: 20 },
        { x: 50, y: 55 },
        { x: 35, y: 100 },
        { x: 50, y: 145 },
        { x: 95, y: 175 },
        { x: 145, y: 160 },
        { x: 160, y: 120 },
        { x: 140, y: 90 },
        { x: 55, y: 95 },
      ],
    ],
  },
  {
    id: "7",
    label: "7",
    type: "number",
    color: NUMBER_COLORS[7],
    strokes: [
      [
        { x: 35, y: 20 },
        { x: 165, y: 20 },
        { x: 90, y: 180 },
      ],
    ],
  },
  {
    id: "8",
    label: "8",
    type: "number",
    color: NUMBER_COLORS[8],
    strokes: [
      [
        { x: 100, y: 100 },
        { x: 50, y: 75 },
        { x: 50, y: 35 },
        { x: 100, y: 20 },
        { x: 150, y: 35 },
        { x: 150, y: 75 },
        { x: 100, y: 100 },
        { x: 50, y: 125 },
        { x: 50, y: 165 },
        { x: 100, y: 180 },
        { x: 150, y: 165 },
        { x: 150, y: 125 },
        { x: 100, y: 100 },
      ],
    ],
  },
  {
    id: "9",
    label: "9",
    type: "number",
    color: NUMBER_COLORS[9],
    strokes: [
      [
        { x: 50, y: 160 },
        { x: 100, y: 180 },
        { x: 150, y: 145 },
        { x: 165, y: 100 },
        { x: 150, y: 55 },
        { x: 105, y: 25 },
        { x: 55, y: 40 },
        { x: 40, y: 80 },
        { x: 60, y: 110 },
        { x: 145, y: 105 },
      ],
    ],
  },
];

export const LETTERS = WRITE_CHARS.filter((c) => c.type === "letter");
export const NUMBERS = WRITE_CHARS.filter((c) => c.type === "number");
