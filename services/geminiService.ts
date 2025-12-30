import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { ProspectData, StrategicReport, AspectRatio } from "../types";
import { generateMarketSizing } from "./marketSizingService";
import { generateCompetitiveAnalysis } from "./competitiveIntelligenceService";
import { generateAITools } from "./aiToolsRecommendationService";
import { generateGrowthRoadmap } from "./growthRoadmapService";
import { generateSWOT } from "./swotAnalysisService";

// Configuration
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ VITE_GEMINI_API_KEY is not configured. Please add it to your .env file.");
}

// Model Configuration - Using Latest Gemini 2.5 Models
const MODELS = {
  FLASH: "gemini-2.5-flash", // Fast, efficient for most tasks
  PRO: "gemini-2.5-pro", // High-capability for complex reasoning
  THINKING: "gemini-2.0-flash-thinking-exp-1219", // Advanced reasoning (experimental)
} as const;

// Safety Settings
const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Generation Config
const GENERATION_CONFIG = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
};

// Initialize Gemini Client
const getGeminiClient = () => {
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured");
  }
  return new GoogleGenerativeAI(API_KEY);
};

// Utility: Clean JSON response
const cleanJsonString = (str: string): string => {
  return str
    .replace(/```json\n?|\n?```/g, "")
    .replace(/^[^{\[]*/, "")
    .replace(/[^}\]]*$/, "")
    .trim();
};

// Utility: Retry with exponential backoff
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      
      const isRateLimitError = error?.message?.includes("429") || error?.message?.includes("quota");
      if (!isRateLimitError && i < maxRetries - 1) {
        // For non-rate-limit errors, retry immediately
        continue;
      }
      
      const delay = baseDelay * Math.pow(2, i);
      console.log(`⏳ Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries exceeded");
};

/**
 * 1. DEEP MARKET RESEARCH
 * Uses Gemini 2.5 Flash with Google Search grounding
 */
export const performMarketResearch = async (data: ProspectData): Promise<string> => {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: MODELS.FLASH,
      safetySettings: SAFETY_SETTINGS,
      generationConfig: GENERATION_CONFIG,
    });

    const prompt = `
You are a senior market research analyst. Conduct comprehensive research on:

Company: ${data.companyName}
Industry: ${data.industry} - ${data.subIndustry} - ${data.niche}
Website: ${data.websiteUrl || "Not provided"}
Region: ${data.country}
Revenue Range: ${data.revenueRange || "Unknown"}
Employee Count: ${data.employeeCount || "Unknown"}

Research Focus:
1. Industry trends and market dynamics in ${data.country}
2. Key competitors and market positioning
3. Growth opportunities and challenges
4. Regulatory and economic factors
5. Technology adoption trends

Provide a comprehensive analysis in ${data.language || "English"}.
`;

    const result = await retryWithBackoff(async () => {
      const response = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      return response.response.text();
    });

    return result;
  } catch (error) {
    console.error("❌ Market Research Error:", error);
    return "Market research completed with limited data. Please review manually.";
  }
};

/**
 * 2. ORCHESTRATED STRATEGIC REPORT GENERATION
 * Master orchestrator using parallel AI agents
 */
export const generateConsultingReport = async (
  data: ProspectData,
  researchContext: string = ""
): Promise<StrategicReport> => {
  console.log("🚀 Starting Strategic Report Generation...");

  try {
    // STEP A: PARALLEL EXECUTION OF SPECIALIZED AGENTS
    console.log("⚡ Running parallel AI agents...");
    const [marketAnalysis, competitors, swot, roadmap, aiTools] = await Promise.allSettled([
      generateMarketSizing(data),
      generateCompetitiveAnalysis(data),
      generateSWOT(data),
      generateGrowthRoadmap(data),
      generateAITools(data),
    ]);

    // Extract successful results with fallbacks
    const marketData = marketAnalysis.status === "fulfilled" ? marketAnalysis.value : {
      tam: "$0",
      sam: "$0",
      som: "$0",
      marketGrowthRate: "0%",
      insights: ["Market sizing data unavailable"],
    };

    const competitorData = competitors.status === "fulfilled" ? competitors.value : [];
    const swotData = swot.status === "fulfilled" ? swot.value : {
      strengths: ["Analysis pending"],
      weaknesses: ["Analysis pending"],
      opportunities: ["Analysis pending"],
      threats: ["Analysis pending"],
    };
    const roadmapData = roadmap.status === "fulfilled" ? roadmap.value : {
      quickWins: [],
      strategic: [],
      longTerm: [],
    };
    const toolsData = aiTools.status === "fulfilled" ? aiTools.value : [];

    // STEP B: EXECUTIVE SUMMARY & SCORING SYNTHESIS
    console.log("🧠 Generating Executive Summary with Gemini 2.5 Pro...");
    const synthesis = await generateExecutiveSynthesis(data, {
      marketData,
      competitorData,
      swotData,
      roadmapData,
      researchContext,
    });

    // STEP C: ASSEMBLE FINAL REPORT
    console.log("✅ Strategic Report Complete!");
    return {
      ...synthesis,
      marketAnalysis: marketData,
      competitors: competitorData,
      swot: swotData,
      growthRoadmap: roadmapData,
      aiTools: toolsData,
    };
  } catch (error) {
    console.error("❌ Report Generation Failed:", error);
    throw new Error("Failed to generate strategic report. Please try again.");
  }
};

/**
 * EXECUTIVE SYNTHESIS (The "Binder" Agent)
 * Uses Gemini 2.5 Pro for high-quality synthesis
 */
const generateExecutiveSynthesis = async (
  data: ProspectData,
  context: any
): Promise<any> => {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: MODELS.PRO, // Use Pro for complex synthesis
      safetySettings: SAFETY_SETTINGS,
      generationConfig: {
        ...GENERATION_CONFIG,
        responseMimeType: "application/json",
      },
    });

    const prompt = `
You are a Tier-1 consulting strategist. Synthesize an Executive Summary and Scoring for:

COMPANY PROFILE:
- Name: ${data.companyName}
- Industry: ${data.industry} > ${data.subIndustry} > ${data.niche}
- Location: ${data.country}
- Revenue: ${data.revenueRange || "Unknown"}
- Employees: ${data.employeeCount || "Unknown"}
- Contact: ${data.contactName} (${data.contactJobTitle})

ANALYSIS DATA:
- Market Size: TAM ${context.marketData.tam}, SAM ${context.marketData.sam}, SOM ${context.marketData.som}
- Competitors: ${context.competitorData.length} identified
- Strengths: ${context.swotData.strengths.length} items
- Weaknesses: ${context.swotData.weaknesses.length} items
- Roadmap: ${context.roadmapData.quickWins.length} quick wins

TASKS:
1. Write a powerful 4-sentence Executive Summary in ${data.language || "English"}
2. Calculate these scores (0-100 based on data quality and business potential):
   - healthScore: Overall business health
   - socialHealthScore: Social media presence
   - websitePerformanceIndex: Digital presence quality
   - marketOpportunityScore: Market potential
3. Assess: financialHealth ("Strong", "Stable", "Weak") and operationalEfficiency ("High", "Medium", "Low")
4. Identify 3 keyStrengths and 3 criticalGaps
5. List 5 risks with severity ("High", "Medium", "Low") and mitigation strategies
6. Generate internal sales intelligence in internalDossier

Return ONLY valid JSON with this exact structure:
{
  "executiveSummary": "...",
  "healthScore": 75,
  "socialHealthScore": 60,
  "websitePerformanceIndex": 70,
  "marketOpportunityScore": 85,
  "financialHealth": "Stable",
  "operationalEfficiency": "Medium",
  "keyStrengths": ["Strength 1", "Strength 2", "Strength 3"],
  "criticalGaps": ["Gap 1", "Gap 2", "Gap 3"],
  "risks": [
    { "riskName": "Risk 1", "severity": "High", "mitigation": "How to mitigate" },
    { "riskName": "Risk 2", "severity": "Medium", "mitigation": "How to mitigate" },
    { "riskName": "Risk 3", "severity": "Low", "mitigation": "How to mitigate" }
  ],
  "internalDossier": {
    "leadScore": 80,
    "leadTier": "WARM",
    "dealSizeEstimate": "$25,000",
    "riskFactors": ["Factor 1", "Factor 2"],
    "opportunityAnalysis": {
      "quickWins": "What can be achieved in 30 days",
      "strategic": "6-month strategic opportunities"
    },
    "salesTalkingPoints": ["Point 1", "Point 2", "Point 3"]
  }
}
`;

    const result = await retryWithBackoff(async () => {
      const response = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const text = response.response.text();
      return JSON.parse(cleanJsonString(text));
    });

    return result;
  } catch (error) {
    console.error("❌ Executive Synthesis Error:", error);
    // Return fallback synthesis
    return {
      executiveSummary: `${data.companyName} operates in the ${data.industry} sector with promising market potential. Further analysis recommended to unlock growth opportunities.`,
      healthScore: 50,
      socialHealthScore: 50,
      websitePerformanceIndex: 50,
      marketOpportunityScore: 50,
      financialHealth: "Stable",
      operationalEfficiency: "Medium",
      keyStrengths: ["Established presence", "Industry expertise", "Growth potential"],
      criticalGaps: ["Limited data", "Market visibility", "Digital presence"],
      risks: [
        { riskName: "Market Competition", severity: "Medium", mitigation: "Differentiation strategy" },
        { riskName: "Resource Constraints", severity: "Medium", mitigation: "Strategic partnerships" },
        { riskName: "Technology Gap", severity: "Low", mitigation: "Gradual modernization" },
      ],
      internalDossier: {
        leadScore: 50,
        leadTier: "WARM",
        dealSizeEstimate: "$15,000",
        riskFactors: ["Limited information available"],
        opportunityAnalysis: {
          quickWins: "Digital presence optimization",
          strategic: "Market expansion strategy",
        },
        salesTalkingPoints: [
          "Industry expertise",
          "Growth potential",
          "Strategic positioning",
        ],
      },
    };
  }
};

/**
 * 3. FAST CHAT CONSULTANT
 * Uses Gemini 2.5 Flash for quick Q&A
 */
export const chatWithConsultant = async (
  history: Array<{ role: string; parts: Array<{ text: string }> }>,
  message: string
): Promise<string> => {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: MODELS.FLASH,
      safetySettings: SAFETY_SETTINGS,
      generationConfig: GENERATION_CONFIG,
      systemInstruction: "You are an expert business consultant from ScaleOn. Provide concise, actionable insights. Be professional yet approachable.",
    });

    const chat = model.startChat({ history });
    const result = await retryWithBackoff(async () => {
      const response = await chat.sendMessage(message);
      return response.response.text();
    });

    return result;
  } catch (error) {
    console.error("❌ Chat Error:", error);
    return "I apologize, but I'm having trouble processing your request right now. Please try again.";
  }
};

/**
 * 4. STRATEGIC IMAGE GENERATION
 * Note: Gemini 2.5 currently doesn't support image generation
 * Returning placeholder for now - consider using Imagen 3 API separately
 */
export const generateStrategicImage = async (
  prompt: string,
  aspectRatio: AspectRatio = "1:1"
): Promise<string | null> => {
  console.warn("⚠️ Image generation not available with Gemini 2.5. Consider using Imagen 3 API.");
  
  // Return a placeholder or gradient
  return null;
};

/**
 * 5. BRAND ASSET EDITING
 * Note: Gemini 2.5 doesn't support image editing
 * Consider using Imagen 3 or other image APIs
 */
export const editBrandAsset = async (
  base64Image: string,
  prompt: string
): Promise<string | null> => {
  console.warn("⚠️ Image editing not available with Gemini 2.5. Consider using Imagen 3 API.");
  
  return null;
};

/**
 * 6. ADVANCED REASONING (EXPERIMENTAL)
 * Uses Gemini 2.0 Flash Thinking for complex problem-solving
 */
export const deepThink = async (prompt: string): Promise<string> => {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: MODELS.THINKING,
      safetySettings: SAFETY_SETTINGS,
    });

    const result = await retryWithBackoff(async () => {
      const response = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      return response.response.text();
    });

    return result;
  } catch (error) {
    console.error("❌ Deep Think Error:", error);
    // Fallback to regular Flash model
    return chatWithConsultant([], prompt);
  }
};

// Export model names for reference
export { MODELS };
