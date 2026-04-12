export type RiskLevel = "Low" | "Medium" | "High";

export type ReuseIdea = {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  time: string;
  summary: string;
};

export type MockAnalysisResult = {
  itemName: string;
  detectedMaterial: string;
  confidencePct: number;
  riskLevel: RiskLevel;
  riskNote: string;
  ideas: ReuseIdea[];
};

export const mockAnalysis: MockAnalysisResult = {
  itemName: "Old Smartphone",
  detectedMaterial: "Mixed electronics (PCB + Lithium battery)",
  confidencePct: 92,
  riskLevel: "Medium",
  riskNote:
    "Avoid puncturing the battery. Work in a ventilated area and power the device off.",
  ideas: [
    {
      title: "Desk info display (clock + weather)",
      difficulty: "Easy",
      time: "30–60 min",
      summary: "Turn it into a dedicated always-on display using a web dashboard.",
    },
    {
      title: "Security camera (Wi‑Fi)",
      difficulty: "Medium",
      time: "1–2 hrs",
      summary: "Reuse the camera for basic monitoring with a lightweight app.",
    },
    {
      title: "Retro music player",
      difficulty: "Easy",
      time: "20–40 min",
      summary: "Offline playlists, minimalist launcher, and one purpose only.",
    },
    {
      title: "LED notification light (via OTG)",
      difficulty: "Hard",
      time: "2–4 hrs",
      summary: "Use OTG + microcontroller to drive status LEDs for your desk setup.",
    },
  ],
};
