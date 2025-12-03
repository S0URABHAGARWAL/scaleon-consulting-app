
import { GoogleGenAI } from "@google/genai";
import { ProspectData, MarketSizing } from "../types";

const cleanJsonString = (str: string) => str.replace(/```json\n?|\n?```/g, "").trim();

export const generateMarketSizing = async (data: ProspectData): Promise<MarketSizing> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash";

  const prompt = `
    Generate a Market Sizing analysis (TAM/SAM/SOM) for:
    Company: ${data.companyName}
    Industry: ${data.industry} > ${data.subIndustry} > ${data.niche}
    Location: ${data.location}
    Currency: ${data.currencyCode} (Use ${data.currencyCode} for all values)

    Task:
    Estimate the Total Addressable Market (TAM), Serviceable Addressable Market (SAM), and Serviceable Obtainable Market (SOM).
    Provide numeric values for charting (relative scale 1-100 or actual amounts) and formatted strings.
    Estimate CAGR (Growth Rate).

    Return JSON:
    {
      "tam": "string ($10B)", "tamValue": number (100),
      "sam": "string ($2B)", "samValue": number (20),
      "som": "string ($100M)", "somValue": number (1),
      "cagr": "string (12%)",
      "marketOutlook": "Short paragraph on market trends."
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
    console.error("Market Sizing Failed", e);
    return {
      tam: "Unknown", tamValue: 100,
      sam: "Unknown", samValue: 50,
      som: "Unknown", somValue: 10,
      cagr: "N/A", marketOutlook: "Market data unavailable."
    };
  }
};
