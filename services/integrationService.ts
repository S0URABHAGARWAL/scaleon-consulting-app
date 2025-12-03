
import { ProspectData, StrategicReport, InternalIntel } from "../types";

export const IntegrationService = {
  // --- 1. LEAD SCORING ALGORITHM ---
  calculateLeadScore: (data: ProspectData): number => {
      let score = 50; // Base Score

      // Revenue Tier
      const rev = data.financialMetrics.annualRevenue || "";
      if (rev.includes("$10M") || rev.includes("$50M")) score += 20;
      else if (rev.includes("$5M")) score += 15;
      else if (rev.includes("$1M")) score += 10;
      
      // Decision Maker
      if (data.isDecisionMaker === 'yes') score += 15;
      else if (data.isDecisionMaker === 'shared') score += 5;

      // Timeline
      if (data.desiredTimeline === 'ASAP') score += 20;
      else if (data.desiredTimeline === '0-3 months') score += 10;

      // Budget
      if (data.investmentReadiness.includes('Budget')) score += 20;
      else if (data.investmentReadiness.includes('Ready')) score += 10;

      // Social Health Signal (Active = good fit for scale)
      if (data.socialMetrics.contentStrategy.includes('Active')) score += 5;

      // Team Size (Larger teams need more help)
      if (data.operationalMetrics.teamSize.includes('51') || data.operationalMetrics.teamSize.includes('200')) score += 10;

      return Math.min(score, 100);
  },

  // --- 2. BACKEND SUBMISSION SIMULATION ---
  submitLeadAndFinalize: async (data: ProspectData, report: StrategicReport) => {
      const leadScore = IntegrationService.calculateLeadScore(data);
      
      // This payload matches the expanded backend schema
      const backendPayload = {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          
          // Contact
          founder_name: data.founderName,
          founder_role: data.title,
          founder_email: data.email,
          founder_phone: data.phone,
          
          // Company Deep Dive
          company_name: data.companyName,
          company_website: data.websiteMetrics.url,
          location: data.location,
          industry: data.industry,
          
          // Research Data
          social_linkedin: data.socialMetrics.linkedinUrl,
          financial_revenue: data.financialMetrics.annualRevenue,
          financial_growth: data.financialMetrics.growthRateYoY,
          ops_team_size: data.operationalMetrics.teamSize,
          market_tam: data.marketMetrics.tam,
          
          // Sales Engine
          lead_gen_score: data.leadGenScore,
          sales_challenge: data.mainSalesChallenge,
          
          // Scoring & Intel
          lead_score: leadScore,
          lead_tier: leadScore > 80 ? 'HOT' : leadScore > 60 ? 'WARM' : 'COOL',
          internal_intel: report.internalDossier, 
          
          // Tracking
          email_sent: true
      };

      console.log("🚀 SIMULATING BACKEND SUBMISSION...");
      console.log("➡️ Sending to Supabase DB:", backendPayload);
      console.log("➡️ Triggering Resend API (Internal Email to sales@scaleonconsulting.com)");
      console.log("➡️ Triggering Resend API (Client Email to " + data.email + ")");
      
      return true;
  },

  // --- 3. LOCAL BACKUP ---
  saveProspect: (data: ProspectData, report?: StrategicReport) => {
      const dbStr = localStorage.getItem('scaleon_db');
      const db = dbStr ? JSON.parse(dbStr) : [];
      db.push({ ...data, report: report ? 'Generated' : 'Pending', date: new Date().toISOString() });
      localStorage.setItem('scaleon_db', JSON.stringify(db));
  },
  
  exportDatabaseToCSV: () => {
      // ... existing csv logic ...
  }
};
