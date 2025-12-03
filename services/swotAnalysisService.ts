
import { GoogleGenAI } from "@google/genai";
import { ProspectData, SWOT } from "../types";

const cleanJsonString = (str: string) => str.replace(/```json\n?|\n?```/g, "").trim();

export const generateSWOT = async (data: ProspectData): Promise<SWOT> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash";

  const prompt = `
    Perform a SWOT Analysis for:
    Company: ${data.companyName} (${data.industry})
    Niche: ${data.niche}
    Context: ${data.companyName} is a ${data.competitiveMetrics.marketPosition} in the market.
    
    Provide 5-7 items for each category (Strengths, Weaknesses, Opportunities, Threats).
    For each item, provide a short 1-sentence "actionItem" on how to leverage or mitigate it.

    Return JSON:
    {
      "strengths": [{ "text": "...", "actionItem": "..." }],
      "weaknesses": [{ "text": "...", "actionItem": "..." }],
      "opportunities": [{ "text": "...", "actionItem": "..." }],
      "threats": [{ "text": "...", "actionItem": "..." }]
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
    console.error("SWOT Failed", e);
    return { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  }
};
