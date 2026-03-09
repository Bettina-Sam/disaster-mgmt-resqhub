// Simple content model for now. We can expand later.
export const LESSONS = [
  {
    id: "flood-l1",
    title: "Flood Safety — Level 1",
    duration: "6–8 min",
    badge: "Beginner",
    slides: [
      { h: "What is a Flood?", p: "Floods happen when water overflows onto normally dry land." },
      { h: "Before a Flood", p: "Prepare a go-bag, keep documents sealed, move valuables higher." },
      { h: "During a Flood", p: "Stay on high ground, avoid moving water, never drive through floods." },
      { h: "After a Flood", p: "Avoid open wires, don’t use wet appliances, boil water if unsure." },
    ],
    quiz: [
      { q: "What should you avoid during a flood?", options: ["Moving water", "Sunny areas", "Trees"], answer: 0 },
      { q: "Where should documents be kept pre-flood?", options: ["Sealed & high", "Under bed", "Garage floor"], answer: 0 },
      { q: "If water looks clean after flood, drink it?", options: ["Yes", "No, boil first"], answer: 1 },
      { q: "Best immediate action?", options: ["Go to low areas", "Climb to higher ground"], answer: 1 },
      { q: "Drive through floodwater?", options: ["Never", "Sometimes"], answer: 0 },
    ],
  },
];
