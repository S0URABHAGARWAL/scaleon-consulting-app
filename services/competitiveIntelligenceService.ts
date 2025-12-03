
import { GoogleGenAI } from "@google/genai";
import { ProspectData, Competitor } from "../types";

const cleanJsonString = (str: string) => str.replace(/```json\n?|\n?```/g, "").trim();

export const generateCompetitiveAnalysis = async (data: ProspectData): Promise<Competitor[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash";

  const prompt = `
    Analyze the competitive landscape for:
    Company: ${data.companyName}
    Industry: ${data.industry} > ${data.subIndustry}
    Niche: ${data.niche}
    Location: ${data.location}

    Identify 3 likely competitors (direct or indirect).
    For each, provide:
    - Name
    - Market Share Estimate (e.g., "High", "15%", "Leader")
    - Key Strengths (array)
    - Weaknesses (array)
    - Pricing Strategy
    - Key Differentiation vs ${data.companyName}

    Return JSON Array:
    [
      {
        "name": "Competitor A",
        "marketShareEstimate": "...",
        "strengths": ["..."],
        "weaknesses": ["..."],
        "pricingStrategy": "...",
        "differentiation": "..."
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: prompt }] },
      config: { 
        responseMimeType: "application/json",
        // tools: [{ googleSearch: {} }] // Use search if available/stable, else strictly model knowledge
      }
    });
    return JSON.parse(cleanJsonString(response.text || "[]"));
  } catch (e) {
    console.error("Competitive Analysis Failed", e);
    return [];
  }
};
