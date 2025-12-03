
import { GoogleGenAI } from "@google/genai";
import { ProspectData, AITool } from "../types";

const cleanJsonString = (str: string) => str.replace(/```json\n?|\n?```/g, "").trim();

export const generateAITools = async (data: ProspectData): Promise<AITool[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash";

  const prompt = `
    Recommend 8-12 AI Tools for a company in:
    Industry: ${data.industry} > ${data.subIndustry}
    Niche: ${data.niche}
    Role: ${data.title} (Focus on tools relevant to this role and company scaling)
    Currency: ${data.currencyCode}

    Categories to cover: Sales, Marketing, Operations, Analytics, Content.

    Return JSON Array:
    [
      {
        "category": "Marketing",
        "name": "Jasper.ai",
        "description": "Content generation...",
        "roiEstimate": "Save 20hrs/week",
        "implementationTime": "Immediate",
        "cost": "$49/mo"
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: prompt }] },
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJsonString(response.text || "[]"));
  } catch (e) {
    console.error("AI Tools Failed", e);
    return [];
  }
};
