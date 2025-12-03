import { GoogleGenAI } from "@google/genai";
import { DynamicQuestion, Language } from "../types";

const cleanJsonString = (str: string) => str.replace(/```json\n?|\n?```/g, "").trim();

export const generateNicheQuestions = async (
  industry: string,
  subIndustry: string,
  niche: string,
  companyName: string,
  language: Language
): Promise<DynamicQuestion[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash";

  const systemInstruction = `You are a Strategic Management Consultant. Language Context: ${language.name}.`;
  
  const prompt = `
    Context:
    Assessing company: "${companyName}".
    Industry: ${industry} > ${subIndustry} > ${niche}.

    Task:
    Generate 8-10 objective Multiple Choice Questions (MCQ) to diagnose their strategic maturity.
    **CRITICAL**: All Question texts, options, and descriptions MUST be in **${language.name}**.
    
    Constraints:
    - 4-5 options per question.
    - Options should range from "Low Maturity" to "High Maturity".
    - Include a short "description" for each option to explain it.
    - Type should be "single" (radio) or "multiple" (checkbox) depending on the question logic.

    Output Requirement:
    Return strictly valid JSON Array format.
    Schema:
    [
      {
        "id": "q1",
        "text": "Question text...",
        "type": "single",
        "options": [
           { "id": "o1", "label": "Option Label", "description": "Short explanation" }
        ],
        "context": "Why we are asking...",
        "category": "Strategy"
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        systemInstruction: systemInstruction
      }
    });

    const text = response.text || "[]";
    return JSON.parse(cleanJsonString(text)) as DynamicQuestion[];

  } catch (error) {
    console.error("Question generation failed:", error);
    // Fallback logic
    return [
      {
        id: "fallback_1",
        text: "What is your primary revenue model?",
        type: "single",
        options: [
            { id: "f1", label: "One-time Sales", description: "Transactional revenue" },
            { id: "f2", label: "Subscription", description: "Recurring revenue (ARR/MRR)" },
            { id: "f3", label: "Service Retainer", description: "Contract based service" }
        ],
        context: "Understanding revenue quality.",
        category: "Strategy"
      }
    ];
  }
};