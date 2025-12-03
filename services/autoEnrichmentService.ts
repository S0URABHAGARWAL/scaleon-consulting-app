import { GoogleGenAI } from "@google/genai";
import { EnrichedCompanyProfile, Language } from "../types";

const cleanJsonString = (str: string) => str.replace(/```json\n?|\n?```/g, "").trim();

export const enrichCompanyFromUrl = async (
  input: string, 
  language: Language
): Promise<EnrichedCompanyProfile | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash"; 

  // Move complex instructions to user prompt to avoid 500 errors with Tools
  const prompt = `
    Input to analyze: "${input}"
    
    Task:
    1. Perform a deep multi-source search using Google Search grounding.
    2. Look for the company's presence on: LinkedIn, Instagram, Facebook, Twitter (X), TikTok, YouTube, and their official Website.
    3. Look for business registry data if available (e.g., Crunchbase, local registries).
    4. Estimate metrics if exact numbers aren't found (and mark confidence as LOW).

    Output Requirement:
    Return strictly valid JSON. Do not include markdown code blocks.
    Language Context: ${language.name}.
    
    Schema:
    {
      "companyName": "string",
      "industry": "string",
      "location": "string",
      "employeeCount": "string (e.g. '11-50')",
      "estimatedRevenue": "string (e.g. '$1M-$5M')",
      "website": "string",
      "description": "string (1 sentence)",
      "techStack": ["string", "string"],
      "socialPresence": {
        "linkedin": { "url": "string", "followers": "string", "active": boolean },
        "instagram": { "url": "string", "followers": "string", "active": boolean },
        "facebook": { "url": "string", "followers": "string", "active": boolean },
        "twitter": { "url": "string", "followers": "string", "active": boolean },
        "tiktok": { "url": "string", "followers": "string", "active": boolean },
        "youtube": { "url": "string", "subscribers": "string", "active": boolean }
      },
      "confidence": {
        "basicInfo": "HIGH" | "MEDIUM" | "LOW",
        "social": "HIGH" | "MEDIUM" | "LOW"
      },
      "sourcesFound": ["string"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: prompt }] },
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType: "application/json", // Not allowed with googleSearch
        systemInstruction: "You are an advanced digital forensics and market research bot.",
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(cleanJsonString(text)) as EnrichedCompanyProfile;
    
    // Basic validation
    if (!data.companyName) return null;
    
    return data;

  } catch (error) {
    console.error("Multi-source enrichment failed:", error);
    return null;
  }
};