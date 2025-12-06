const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');

admin.initializeApp();
const db = admin.firestore();

// Initialize Gemini AI (optional for Phase 1, using mock data)
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// ==============================================
// PHASE 1: SESSION & WORKFLOW FUNCTIONS
// ==============================================

// Initialize a new session
exports.initSession = functions.https.onCall(async (data, context) => {
  try {
    console.log('Creating new session...');
    
    const sessionRef = db.collection('sessions').doc();
    const sessionId = sessionRef.id;
    
    await sessionRef.set({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'active',
      userId: context.auth?.uid || 'anonymous'
    });
    
    console.log('Session created:', sessionId);
    return { sessionId };
  } catch (error) {
    console.error('Error creating session:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Start company enrichment operation
exports.enrichCompany = functions.https.onCall(async (data, context) => {
  try {
    const { sessionId, company } = data;
    console.log(`Starting enrichment for company: ${company} in session: ${sessionId}`);
    
    const operationRef = db.collection('sessions').doc(sessionId).collection('operations').doc();
    const operationId = operationRef.id;
    
    // Create operation document
    await operationRef.set({
      type: 'enrichment',
      company,
      status: 'processing',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Simulate async enrichment process (in Phase 1, we use mock data)
    // In Phase 2, this would trigger actual web scraping/API calls
    setTimeout(async () => {
      try {
        const mockEnrichmentData = generateMockEnrichmentData(company);
        
        await operationRef.update({
          status: 'completed',
          data: mockEnrichmentData,
          completedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`Enrichment completed for: ${company}`);
      } catch (enrichError) {
        console.error('Enrichment error:', enrichError);
        await operationRef.update({
          status: 'failed',
          error: enrichError.message,
          completedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }, 3000); // 3 second delay to simulate processing
    
    return { operationId };
  } catch (error) {
    console.error('Error starting enrichment:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Generate strategic audit report
exports.generateAudit = functions.https.onCall(async (data, context) => {
  try {
    const { sessionId, prospectData } = data;
    console.log(`Generating audit report for session: ${sessionId}`);
    
    // Generate mock strategic report (Phase 1)
    // In Phase 2, this would use Gemini AI with enriched data
    const report = generateMockStrategicReport(prospectData);
    
    // Store the audit in Firestore
    await db.collection('sessions').doc(sessionId).collection('audits').add({
      prospectData,
      report,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Audit report generated successfully');
    return { report };
  } catch (error) {
    console.error('Error generating audit:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Store prospect data
exports.storeProspect = functions.https.onCall(async (data, context) => {
  try {
    const { prospectData } = data;
    
    const prospectRef = await db.collection('prospects').add({
      ...prospectData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      userId: context.auth?.uid || 'anonymous'
    });
    
    console.log('Prospect stored:', prospectRef.id);
    return { prospectId: prospectRef.id };
  } catch (error) {
    console.error('Error storing prospect:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Get operation status
exports.getOperationStatus = functions.https.onCall(async (data, context) => {
  try {
    const { sessionId, operationId } = data;
    
    const operationDoc = await db
      .collection('sessions')
      .doc(sessionId)
      .collection('operations')
      .doc(operationId)
      .get();
    
    if (!operationDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Operation not found');
    }
    
    return operationDoc.data();
  } catch (error) {
    console.error('Error getting operation status:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// ==============================================
// MOCK DATA GENERATORS (PHASE 1)
// ==============================================

function generateMockEnrichmentData(companyName) {
  return {
    companyName,
    industry: 'Technology',
    location: 'San Francisco, CA',
    employeeCount: '50-200',
    estimatedRevenue: '$5M - $10M',
    website: `https://${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
    description: `${companyName} is a technology company focused on innovative solutions for modern businesses.`,
    techStack: ['React', 'Node.js', 'AWS', 'PostgreSQL'],
    socialPresence: {
      linkedin: { url: `https://linkedin.com/company/${companyName.toLowerCase()}`, followers: '2,500', active: true },
      twitter: { url: `https://twitter.com/${companyName.toLowerCase()}`, followers: '1,200', active: true },
      instagram: { url: `https://instagram.com/${companyName.toLowerCase()}`, followers: '800', active: false }
    },
    confidence: {
      basicInfo: 'HIGH',
      social: 'MEDIUM'
    },
    sourcesFound: ['LinkedIn', 'Company Website', 'Crunchbase']
  };
}

function generateMockStrategicReport(prospectData) {
  const companyName = prospectData.companyName || 'Your Company';
  
  return {
    executiveSummary: `${companyName} is positioned in the ${prospectData.industry || 'Technology'} sector with strong growth potential. Based on our analysis, the company shows promise in market positioning but faces typical scaling challenges common to businesses at this stage. Key opportunities exist in sales process optimization, digital presence enhancement, and operational efficiency improvements.`,
    
    marketAnalysis: {
      tam: '$50 Billion',
      tamValue: 50000000000,
      sam: '$5 Billion',
      samValue: 5000000000,
      som: '$250 Million',
      somValue: 250000000,
      cagr: '15.2%',
      marketOutlook: 'The market shows strong growth trajectory with increasing demand for digital transformation solutions. Competition is moderate but intensifying.'
    },
    
    competitors: [
      {
        name: 'CompetitorOne',
        marketShareEstimate: '12%',
        strengths: ['Strong brand recognition', 'Large sales team', 'Established customer base'],
        weaknesses: ['Legacy technology', 'Slow innovation cycle', 'Higher pricing'],
        pricingStrategy: 'Premium positioning',
        differentiation: 'Market leader with enterprise focus'
      },
      {
        name: 'CompetitorTwo',
        marketShareEstimate: '8%',
        strengths: ['Modern technology stack', 'Aggressive pricing', 'Fast-growing'],
        weaknesses: ['Limited brand awareness', 'Smaller team', 'Customer service issues'],
        pricingStrategy: 'Value-based pricing',
        differentiation: 'Technology-first approach with startup agility'
      }
    ],
    
    swot: {
      strengths: [
        { text: 'Innovative product offering', actionItem: 'Amplify through content marketing and case studies' },
        { text: 'Experienced leadership team', actionItem: 'Leverage for investor relations and strategic partnerships' },
        { text: 'Strong customer relationships', actionItem: 'Build referral program and testimonial strategy' }
      ],
      weaknesses: [
        { text: 'Limited sales pipeline', actionItem: 'Implement structured outbound prospecting system' },
        { text: 'Operational inefficiencies', actionItem: 'Conduct process audit and implement automation tools' },
        { text: 'Small marketing budget', actionItem: 'Focus on high-ROI channels and organic growth strategies' }
      ],
      opportunities: [
        { text: 'Growing market demand', actionItem: 'Accelerate go-to-market strategy and expand sales team' },
        { text: 'Strategic partnerships available', actionItem: 'Identify and engage 3-5 key potential partners' },
        { text: 'Technology differentiation', actionItem: 'Patent key innovations and highlight in positioning' }
      ],
      threats: [
        { text: 'Increasing competition', actionItem: 'Strengthen unique value proposition and customer loyalty' },
        { text: 'Economic uncertainty', actionItem: 'Diversify customer base and build financial reserves' },
        { text: 'Talent acquisition challenges', actionItem: 'Develop strong employer brand and retention programs' }
      ]
    },
    
    growthRoadmap: {
      quickWins: {
        phaseName: '90-Day Quick Wins',
        duration: '3 months',
        initiatives: [
          { title: 'Optimize sales funnel conversion rates', impact: '+25% pipeline velocity' },
          { title: 'Launch referral program', impact: '15-20 qualified leads/month' },
          { title: 'Implement CRM hygiene protocols', impact: 'Improved forecast accuracy' }
        ],
        expectedOutcome: 'Immediate revenue impact with 15-20% increase in close rates'
      },
      strategic: {
        phaseName: '180-Day Strategic Initiatives',
        duration: '6 months',
        initiatives: [
          { title: 'Expand sales team by 3-5 reps', impact: '2x pipeline generation' },
          { title: 'Build content marketing engine', impact: '40% reduction in CAC' },
          { title: 'Implement sales enablement platform', impact: '30% faster ramp time' }
        ],
        expectedOutcome: 'Scalable growth infrastructure supporting 50-75% YoY growth'
      },
      longTerm: {
        phaseName: '1-Year Transformation',
        duration: '12 months',
        initiatives: [
          { title: 'Launch second product line', impact: '+$2M ARR opportunity' },
          { title: 'Expand to adjacent markets', impact: '3x addressable market' },
          { title: 'Build strategic partnerships', impact: '25-30% of revenue from channel' }
        ],
        expectedOutcome: 'Market leadership position with $10M+ ARR trajectory'
      }
    },
    
    aiTools: [
      {
        category: 'Sales Automation',
        name: 'Outreach.io + GPT Integration',
        description: 'AI-powered email sequences with personalization at scale',
        roiEstimate: '200% increase in response rates',
        implementationTime: '2-4 weeks',
        cost: '$200-400/month'
      },
      {
        category: 'Customer Intelligence',
        name: 'Gong.io',
        description: 'Conversation intelligence and deal insights',
        roiEstimate: '15% improvement in close rates',
        implementationTime: '4-6 weeks',
        cost: '$1,200-2,000/month'
      },
      {
        category: 'Marketing Automation',
        name: 'Jasper.ai',
        description: 'AI content generation for blogs, emails, and social',
        roiEstimate: '70% reduction in content creation time',
        implementationTime: '1-2 weeks',
        cost: '$49-125/month'
      }
    ],
    
    risks: [
      {
        riskName: 'Cash flow constraints limiting growth investments',
        severity: 'High',
        mitigation: 'Secure line of credit or bridge financing; prioritize profitable growth'
      },
      {
        riskName: 'Key person dependency in sales',
        severity: 'Medium',
        mitigation: 'Document processes, build redundancy, implement sales playbook'
      },
      {
        riskName: 'Market timing and competitive pressure',
        severity: 'Medium',
        mitigation: 'Accelerate product development, strengthen differentiation messaging'
      }
    ],
    
    healthScore: 72,
    socialHealthScore: 65,
    websitePerformanceIndex: 78,
    marketOpportunityScore: 85,
    
    financialHealth: 'Stable',
    operationalEfficiency: 'Medium',
    
    keyStrengths: [
      'Strong product-market fit with early customers',
      'Experienced founding team with domain expertise',
      'Clear differentiation in competitive landscape'
    ],
    
    criticalGaps: [
      'Lack of structured sales process and playbook',
      'Limited marketing presence and brand awareness',
      'Operational bottlenecks in customer onboarding'
    ],
    
    internalDossier: {
      leadScore: 78,
      leadTier: 'HOT',
      dealSizeEstimate: '$50,000 - $150,000 annual contract value',
      riskFactors: [
        'Decision timeline may extend due to budget planning cycles',
        'Multiple stakeholders require alignment',
        'Previous consulting experiences may create skepticism'
      ],
      opportunityAnalysis: {
        quickWins: 'Sales process optimization can deliver immediate results; strong urgency around growth goals',
        strategic: 'Full consulting engagement with retainer potential; opportunity for HR and operations expansion'
      },
      salesTalkingPoints: [
        'We\'ve helped 50+ companies at similar stage achieve 2-3x revenue growth',
        'Our proven methodology reduces sales cycle time by 30-40%',
        'ROI-focused approach with milestone-based pricing reduces risk',
        'Industry-specific playbooks accelerate time to value'
      ]
    }
  };
}

// ==============================================
// LEGACY FUNCTIONS (Keep for backward compatibility)
// ==============================================

exports.analyzeData = functions.https.onCall(async (data, context) => {
  try {
    const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-pro' }) : null;
    const prompt = data.prompt || 'Analyze the following data';
    const payload = data.payload || {};

    let text = 'Mock analysis result (Gemini API not configured)';
    
    if (model) {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      text = response.text();
    }

    const dbRef = admin.database().ref('analyses');
    const newAnalysis = await dbRef.push();
    await newAnalysis.set({
      uid: context.auth?.uid || 'anonymous',
      input: payload,
      output: text,
      timestamp: admin.database.ServerValue.TIMESTAMP,
      type: data.type || 'general'
    });

    return { success: true, analysis: text, id: newAnalysis.key };
  } catch (error) {
    console.error('Analysis error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

console.log('ScaleOn Consulting Cloud Functions (Phase 1) initialized');
