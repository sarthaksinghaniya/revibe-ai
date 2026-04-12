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
