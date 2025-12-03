
import { GoogleGenAI } from "@google/genai";
import { ProspectData, StrategicReport, AspectRatio, InternalIntel } from "../types";
import { generateMarketSizing } from "./marketSizingService";
import { generateCompetitiveAnalysis } from "./competitiveIntelligenceService";
import { generateAITools } from "./aiToolsRecommendationService";
import { generateGrowthRoadmap } from "./growthRoadmapService";
import { generateSWOT } from "./swotAnalysisService";

const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });
const cleanJsonString = (str: string) => str.replace(/```json\n?|\n?```/g, "").trim();

// 1. DEEP RESEARCH (Kept for compatibility, though we use services now)
export const performMarketResearch = async (data: ProspectData) => {
  // Logic moved to individual services, but this can serve as a warm-up or broad search
  return "Research performed via individual agents.";
};

// 2. ORCHESTRATED STRATEGIC REPORT GENERATION
export const generateConsultingReport = async (data: ProspectData, researchContext: string = ""): Promise<StrategicReport> => {
  const ai = getAiClient();
  
  // A. PARALLEL EXECUTION OF SPECIALIZED AGENTS
  const [marketAnalysis, competitors, swot, roadmap, aiTools] = await Promise.all([
    generateMarketSizing(data),
    generateCompetitiveAnalysis(data),
    generateSWOT(data),
    generateGrowthRoadmap(data),
    generateAITools(data)
  ]);

  // B. EXECUTIVE SUMMARY & SCORING (The "Binder" Agent)
  const summaryModel = "gemini-3-pro-preview"; // Use Pro for the synthesis
  const summaryPrompt = `
    Synthesize an Executive Summary and Scores for a consulting report.
    Company: ${data.companyName}
    Industry: ${data.industry}
    Data Points:
    - TAM: ${marketAnalysis.tam}
    - Competitors: ${competitors.length} identified
    - SWOT: ${swot.strengths.length} strengths identified
    - Roadmap: 3 phases defined
    
    Task:
    1. Write a 3-4 sentence powerful Executive Summary in ${data.language}.
    2. Calculate scores (0-100) based on the profile provided.
    3. Identify Top 5 Risks and mitigation.
    4. Provide Key Strengths and Critical Gaps (3 each).

    Return JSON:
    {
      "executiveSummary": "...",
      "healthScore": 75,
      "socialHealthScore": 60,
      "websitePerformanceIndex": 50,
      "marketOpportunityScore": 85,
      "financialHealth": "Stable",
      "operationalEfficiency": "Medium",
      "keyStrengths": ["..."],
      "criticalGaps": ["..."],
      "risks": [
        { "riskName": "...", "severity": "High", "mitigation": "..." }
      ],
      "internalDossier": {
        "leadScore": 80,
        "leadTier": "WARM",
        "dealSizeEstimate": "$25k",
        "riskFactors": ["..."],
        "opportunityAnalysis": { "quickWins": "...", "strategic": "..." },
        "salesTalkingPoints": ["..."]
      }
    }
  `;

  let synthesis = {
    executiveSummary: "Analysis pending...",
    healthScore: 50,
    socialHealthScore: 50,
    websitePerformanceIndex: 50,
    marketOpportunityScore: 50,
    financialHealth: "Stable" as const,
    operationalEfficiency: "Medium" as const,
    keyStrengths: [],
    criticalGaps: [],
    risks: [],
    internalDossier: {
        leadScore: 50,
        leadTier: 'WARM' as const,
        dealSizeEstimate: "$10k",
        riskFactors: [],
        opportunityAnalysis: { quickWins: "", strategic: "" },
        salesTalkingPoints: []
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: summaryModel,
      contents: { parts: [{ text: summaryPrompt }] },
      config: { responseMimeType: "application/json" }
    });
    synthesis = JSON.parse(cleanJsonString(response.text || "{}"));
  } catch (e) {
    console.error("Synthesis Failed", e);
  }

  // C. ASSEMBLE FINAL REPORT
  return {
    ...synthesis,
    marketAnalysis,
    competitors,
    swot,
    growthRoadmap: roadmap,
    aiTools
  };
};

// 3. FAST CHAT
export const chatWithConsultant = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash-lite"; 

  const chat = ai.chats.create({
    model,
    history: history,
    config: {
      systemInstruction: "You are a helpful, concise business consultant assistant from ScaleOn. Keep answers brief and actionable."
    }
  });

  const result = await chat.sendMessage({ message });
  return result.text;
};

// 4. GENERATE IMAGES
export const generateStrategicImage = async (prompt: string, aspectRatio: AspectRatio) => {
  const ai = getAiClient();
  const model = "gemini-3-pro-image-preview";

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio, imageSize: "1K" } }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return null;
};

// 5. EDIT IMAGES
export const editBrandAsset = async (base64Image: string, prompt: string) => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash-image";

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: "image/png" } },
        { text: prompt }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return null;
};
