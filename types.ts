
export interface ProspectData {
  // --- METADATA ---
  id?: string;
  timestamp?: string;
  language: string;
  countryCode: string;
  currencyCode: string;
  
  // --- 1. FOUNDER/CONTACT (BASICS) ---
  founderName: string;
  title: string;
  email: string;
  phone: string;
  companyName: string;
  location: string;
  
  // --- TAXONOMY ---
  industry: string;      // Top Level
  subIndustry?: string;  // Level 2
  niche?: string;        // Level 3

  // --- ENRICHMENT METADATA ---
  isEnriched: boolean;
  linkedinUrl?: string;

  // --- DYNAMIC DISCOVERY ANSWERS ---
  dynamicAnswers: {
    questionId: string;
    questionText: string;
    answer: string[] | string;
    category: string;
  }[];

  // --- METRICS ---
  socialMetrics: {
    linkedinUrl: string;
    linkedinFollowers: string;
    twitterHandle: string;
    instagramHandle: string;
    contentStrategy: string;
  };
  websiteMetrics: {
    url: string;
    monthlyTraffic: string;
    conversionRate: string;
    platform: string;
  };
  competitiveMetrics: {
    topCompetitors: string;
    keyDifferentiator: string;
    marketPosition: 'Leader' | 'Challenger' | 'Niche Player' | 'New Entrant';
  };
  marketMetrics: {
    targetAudience: string;
    tam: string;
    geoFocus: 'Local' | 'National' | 'Global';
  };
  financialMetrics: {
    annualRevenue: string;
    growthRateYoY: string;
    profitMargin: string;
    averageContractValue: string;
  };
  operationalMetrics: {
    teamSize: string;
    teamStructure: string;
    churnRate: string;
    cac: string;
  };
  
  // Legacy scores
  leadGenScore: number; 
  inboundQualityScore: number;
  outboundScore: number;
  salesProcessScore: number;
  crmScore: number;
  mainSalesChallenge: string;
  pastEfforts: string;
  bestChannels: string[];
  
  isDecisionMaker: string;
  otherStakeholders: string;
  decisionStyle: 'Gut-driven' | 'ROI-model' | 'Board-driven' | 'Test-first';
  riskPosture: 'Conservative' | 'Balanced' | 'Aggressive';
  decisionMakerDetails?: { name: string; title: string; email: string; phone: string; };

  triggerEvent: string;
  desiredTimeline: 'ASAP' | '0-3 months' | '3-6 months' | '6-12 months';
  investmentReadiness: 'Exploring' | 'Ready if strong case' | 'Budget Allocated';

  helpType: string[];
  preferredStyle: 'Workshops' | 'Fast Experiments' | 'You Handle It';
}

export interface MarketSizing {
  tam: string; // Total Addressable Market
  tamValue: number; // Numeric for charts
  sam: string; // Serviceable Addressable Market
  samValue: number;
  som: string; // Serviceable Obtainable Market
  somValue: number;
  cagr: string;
  marketOutlook: string;
}

export interface Competitor {
  name: string;
  marketShareEstimate: string;
  strengths: string[];
  weaknesses: string[];
  pricingStrategy: string;
  differentiation: string;
}

export interface AITool {
  category: string;
  name: string;
  description: string;
  roiEstimate: string;
  implementationTime: string;
  cost: string;
}

export interface RoadmapPhase {
  phaseName: string;
  duration: string;
  initiatives: { title: string; impact: string }[];
  expectedOutcome: string;
}

export interface SWOTItem {
  text: string;
  actionItem: string;
}

export interface SWOT {
  strengths: SWOTItem[];
  weaknesses: SWOTItem[];
  opportunities: SWOTItem[];
  threats: SWOTItem[];
}

export interface Risk {
  riskName: string;
  severity: 'High' | 'Medium' | 'Low';
  mitigation: string;
}

export interface StrategicReport {
  // New Premium Structure
  executiveSummary: string;
  
  marketAnalysis: MarketSizing;
  competitors: Competitor[];
  swot: SWOT;
  growthRoadmap: {
    quickWins: RoadmapPhase; // 90 Days
    strategic: RoadmapPhase; // 180 Days
    longTerm: RoadmapPhase;  // 1 Year
  };
  aiTools: AITool[];
  risks: Risk[];
  
  // Scoring & Metrics
  healthScore: number;
  socialHealthScore: number;
  websitePerformanceIndex: number;
  marketOpportunityScore: number;
  
  financialHealth: "Strong" | "Stable" | "At Risk";
  operationalEfficiency: "High" | "Medium" | "Low";
  
  keyStrengths: string[];
  criticalGaps: string[];
  
  // Internal (kept for CRM integration)
  internalDossier: InternalIntel;
}

export interface InternalIntel {
  leadScore: number;
  leadTier: 'HOT' | 'WARM' | 'COOL' | 'COLD';
  dealSizeEstimate: string;
  riskFactors: string[];
  opportunityAnalysis: {
    quickWins: string;
    strategic: string;
  };
  salesTalkingPoints: string[];
}

export interface SocialPresence {
  linkedin?: { url?: string; followers: string; active: boolean };
  instagram?: { url?: string; followers: string; active: boolean };
  facebook?: { url?: string; followers: string; active: boolean };
  twitter?: { url?: string; followers: string; active: boolean };
  tiktok?: { url?: string; followers: string; active: boolean };
  youtube?: { url?: string; subscribers: string; active: boolean };
}

export interface EnrichedCompanyProfile {
  companyName: string;
  industry: string;
  location: string;
  employeeCount: string;
  estimatedRevenue: string;
  website: string;
  description: string;
  techStack?: string[];
  socialPresence: SocialPresence;
  confidence: {
    basicInfo: 'HIGH' | 'MEDIUM' | 'LOW';
    social: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  sourcesFound: string[];
}

export interface MCQOption {
  id: string;
  label: string;
  description?: string;
}

export interface DynamicQuestion {
  id: string;
  text: string;
  type: 'single' | 'multiple';
  options: MCQOption[];
  context: string;
  category: 'Strategy' | 'Operations' | 'Sales' | 'Tech';
}

export interface IndustryNode {
  [key: string]: string[] | IndustryNode;
}

export type AspectRatio = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9";

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type NumberingSystem = 'international' | 'indian';

export interface Currency {
  code: string; 
  symbol: string; 
  name: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface Country {
  code: string;
  name: string;
  flag: string;
  currency: Currency;
  numberingSystem: NumberingSystem;
  languages: Language[];
}
