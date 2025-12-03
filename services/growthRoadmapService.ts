
import { GoogleGenAI } from "@google/genai";
import { ProspectData, RoadmapPhase } from "../types";

const cleanJsonString = (str: string) => str.replace(/```json\n?|\n?```/g, "").trim();

export interface FullRoadmap {
  quickWins: RoadmapPhase;
  strategic: RoadmapPhase;
  longTerm: RoadmapPhase;
}

export const generateGrowthRoadmap = async (data: ProspectData): Promise<FullRoadmap> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash"; // Using Flash for speed as logic is structured

  const prompt = `
    Create a Strategic Growth Roadmap for:
    Company: ${data.companyName} (${data.industry})
    Current State: ${data.financialMetrics.annualRevenue} revenue, ${data.operationalMetrics.teamSize} team.
    Goal: Scale revenue and efficiency.

    Phases:
    1. Quick Wins (90 Days) - Low hanging fruit, sales fixes.
    2. Strategic Initiatives (180 Days) - Process, Hiring, Tech implementation.
    3. Leadership Position (1 Year) - Market expansion, Brand dominance.

    Return JSON:
    {
      "quickWins": {
        "phaseName": "Foundation & Quick Wins",
        "duration": "0-90 Days",
        "initiatives": [{ "title": "...", "impact": "..." }],
        "expectedOutcome": "..."
      },
      "strategic": {
         // same structure
      },
      "longTerm": {
         // same structure
      }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: prompt }] },
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJsonString(response.text || "{}"));
  } catch (e) {
    console.error("Roadmap Failed", e);
    // Fallback stub
    const emptyPhase = { phaseName: "", duration: "", initiatives: [], expectedOutcome: "" };
    return { quickWins: emptyPhase, strategic: emptyPhase, longTerm: emptyPhase };
  }
};
