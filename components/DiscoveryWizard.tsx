
import React, { useState } from 'react';
import { Button } from './Button';
import { ProspectData, EnrichedCompanyProfile, DynamicQuestion } from '../types';
import { enrichCompanyFromUrl } from '../services/autoEnrichmentService';
import { getIndustries, getSubIndustries, getNiches } from '../services/industryTaxonomyService';
import { generateNicheQuestions } from '../services/questionGeneratorService';
import { ProgressTracker } from './ProgressTracker';
import { SocialEnrichmentProgress } from './SocialEnrichmentProgress';
import { MCQQuestion } from './MCQQuestion';
import { useLanguage } from '../context/LanguageContext';

interface DiscoveryWizardProps {
  onComplete: (data: ProspectData) => void;
}

enum Stage {
  INPUT_SOURCE = 1,
  COMPANY_CONFIRM = 2,
  TAXONOMY = 3,
  QUESTIONS_LOADING = 4,
  MCQ_QUESTIONS = 5,
  REPORT_GENERATING = 6,
  CONTACT_FORM = 7
}

export const DiscoveryWizard: React.FC<DiscoveryWizardProps> = ({ onComplete }) => {
  const { currentLanguage, currentCountry, t, formatCurrency } = useLanguage();
  const [stage, setStage] = useState<Stage>(Stage.INPUT_SOURCE);
  
  // Consistent Input Styling
  const inputClasses = "w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 shadow-sm placeholder:text-gray-400";
  const labelClasses = "block text-sm font-bold text-gray-700 mb-1.5 ml-1";

  // Progress Calculation Logic
  const getProgress = () => {
     switch(stage) {
       case Stage.INPUT_SOURCE: return 10;
       case Stage.COMPANY_CONFIRM: return 25;
       case Stage.TAXONOMY: return 40;
       case Stage.QUESTIONS_LOADING: return 50;
       case Stage.MCQ_QUESTIONS: 
         return 50 + ((currentQuestionIndex / (questions.length || 1)) * 30); // 50-80%
       case Stage.CONTACT_FORM: return 90;
       case Stage.REPORT_GENERATING: return 95;
       default: return 0;
     }
  };

  const [inputSource, setInputSource] = useState('');
  const [enrichmentLoading, setEnrichmentLoading] = useState(false);
  const [enrichmentData, setEnrichmentData] = useState<EnrichedCompanyProfile | null>(null);
  
  const [formData, setFormData] = useState<Partial<ProspectData>>({
    language: currentLanguage.code,
    countryCode: currentCountry.code,
    currencyCode: currentCountry.currency.code,
    isEnriched: false,
    dynamicAnswers: []
  });

  const [questions, setQuestions] = useState<DynamicQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Taxonomy
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedSubIndustry, setSelectedSubIndustry] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('');

  // --- HANDLERS ---

  const handleEnrichment = async () => {
    if (!inputSource.trim()) return;
    setEnrichmentLoading(true);
    setEnrichmentData(null); // Reset prev data

    const enriched = await enrichCompanyFromUrl(inputSource, currentLanguage);
    
    setEnrichmentLoading(false);
    if (enriched) {
      setEnrichmentData(enriched);
      setFormData(prev => ({
        ...prev,
        isEnriched: true,
        companyName: enriched.companyName,
        location: enriched.location,
        industry: enriched.industry,
        websiteMetrics: {
            ...prev.websiteMetrics!,
            url: enriched.website,
            monthlyTraffic: "Est. via Enrichment",
            conversionRate: "Unknown",
            platform: enriched.techStack?.join(", ") || "Unknown"
        },
        financialMetrics: {
             ...prev.financialMetrics!,
            annualRevenue: enriched.estimatedRevenue,
            growthRateYoY: "Unknown",
            profitMargin: "Unknown",
            averageContractValue: "Unknown"
        },
        operationalMetrics: {
            ...prev.operationalMetrics!,
            teamSize: enriched.employeeCount,
            teamStructure: "Unknown",
            churnRate: "Unknown",
            cac: "Unknown"
        },
        socialMetrics: {
            linkedinUrl: enriched.socialPresence?.linkedin?.url || inputSource,
            linkedinFollowers: enriched.socialPresence?.linkedin?.followers || "Unknown",
            twitterHandle: enriched.socialPresence?.twitter?.url || "",
            instagramHandle: enriched.socialPresence?.instagram?.url || "",
            contentStrategy: "Analyzed"
        }
      }));
    }
  };

  const confirmCompanyDetails = () => {
    setStage(Stage.COMPANY_CONFIRM);
  };

  const handleTaxonomyComplete = async () => {
    setStage(Stage.QUESTIONS_LOADING);
    
    setFormData(prev => ({
      ...prev,
      industry: selectedIndustry,
      subIndustry: selectedSubIndustry,
      niche: selectedNiche
    }));

    const generatedQs = await generateNicheQuestions(
      selectedIndustry,
      selectedSubIndustry,
      selectedNiche,
      formData.companyName || "Your Company",
      currentLanguage
    );

    setQuestions(generatedQs);
    setStage(Stage.MCQ_QUESTIONS);
  };

  const handleMCQAnswer = (answer: string[]) => {
    const q = questions[currentQuestionIndex];
    
    const newAnswers = [...(formData.dynamicAnswers || [])];
    const existingIndex = newAnswers.findIndex(a => a.questionId === q.id);
    
    const answerObj = {
      questionId: q.id,
      questionText: q.text,
      answer: answer,
      category: q.category
    };

    if (existingIndex >= 0) newAnswers[existingIndex] = answerObj;
    else newAnswers.push(answerObj);

    setFormData(prev => ({ ...prev, dynamicAnswers: newAnswers }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setStage(Stage.CONTACT_FORM);
    }
  };

  const handleBackQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      setStage(Stage.TAXONOMY);
    }
  };

  const handleFinalSubmit = () => {
     const finalData: ProspectData = {
      language: currentLanguage.code,
      countryCode: currentCountry.code,
      currencyCode: currentCountry.currency.code,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      
      founderName: formData.founderName || "Founder",
      title: formData.title || "CEO",
      email: formData.email || "",
      phone: formData.phone || "",
      companyName: formData.companyName || "Company",
      location: formData.location || currentCountry.name,
      
      industry: selectedIndustry,
      subIndustry: selectedSubIndustry,
      niche: selectedNiche,
      
      isEnriched: !!formData.isEnriched,
      linkedinUrl: formData.socialMetrics?.linkedinUrl || inputSource,
      dynamicAnswers: formData.dynamicAnswers || [],

      socialMetrics: formData.socialMetrics || { linkedinUrl: inputSource, linkedinFollowers: "Unknown", twitterHandle: "", instagramHandle: "", contentStrategy: "Unknown" },
      websiteMetrics: formData.websiteMetrics || { url: "", monthlyTraffic: "Unknown", conversionRate: "Unknown", platform: "Unknown" },
      competitiveMetrics: formData.competitiveMetrics || { topCompetitors: "", keyDifferentiator: "", marketPosition: "Challenger" },
      marketMetrics: formData.marketMetrics || { targetAudience: selectedNiche, tam: "Unknown", geoFocus: "Global" },
      financialMetrics: formData.financialMetrics || { annualRevenue: "Unknown", growthRateYoY: "Unknown", profitMargin: "Unknown", averageContractValue: "Unknown" },
      operationalMetrics: formData.operationalMetrics || { teamSize: "Unknown", teamStructure: "Unknown", churnRate: "Unknown", cac: "Unknown" },
      
      leadGenScore: 3, inboundQualityScore: 3, outboundScore: 3, salesProcessScore: 3, crmScore: 3,
      mainSalesChallenge: "Collected via Discovery", pastEfforts: "", bestChannels: [],
      isDecisionMaker: "yes", otherStakeholders: "", decisionStyle: "ROI-model", riskPosture: "Balanced",
      triggerEvent: "Strategic Review", desiredTimeline: "ASAP", investmentReadiness: "Exploring", helpType: [], preferredStyle: "Fast Experiments"
    };
    onComplete(finalData);
  };

  return (
    <div className="pt-16 pb-12">
      <ProgressTracker currentStage={getProgress()} stageName={t(`step_${Stage[stage].toLowerCase().split('_')[0]}`)} />

      <div className="max-w-3xl mx-auto px-4">
        {/* STAGE 1: ENRICHMENT INPUT */}
        {stage === Stage.INPUT_SOURCE && (
          <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
            <h2 className="text-3xl font-serif font-bold mb-4 text-center">{t('title_input')}</h2>
            <p className="text-muted-foreground text-center mb-8">
              {t('desc_input')}
            </p>

            <div className="flex gap-2 mb-8">
               <input 
                 type="text"
                 value={inputSource}
                 onChange={(e) => setInputSource(e.target.value)}
                 placeholder={t('placeholder_input')}
                 className={inputClasses}
               />
               <Button onClick={handleEnrichment} disabled={!inputSource || enrichmentLoading}>
                 {enrichmentLoading ? t('btn_scanning') : t('btn_analyze')}
               </Button>
            </div>

            <SocialEnrichmentProgress isLoading={enrichmentLoading} data={enrichmentData} />

            {enrichmentData && !enrichmentLoading && (
              <div className="mt-6 text-center animate-fadeIn">
                 <p className="text-green-600 font-bold mb-4">{t('msg_research_complete')} {t('msg_active_channels')}: {Object.keys(enrichmentData.socialPresence).filter(k => enrichmentData.socialPresence[k as keyof typeof enrichmentData.socialPresence]?.active).length}</p>
                 <Button fullWidth onClick={confirmCompanyDetails}>{t('btn_review')}</Button>
              </div>
            )}
            
            {!enrichmentData && !enrichmentLoading && (
                 <div className="text-center mt-4">
                    <button onClick={() => setStage(Stage.COMPANY_CONFIRM)} className="text-sm text-muted-foreground underline">{t('btn_skip')}</button>
                 </div>
            )}
          </div>
        )}

        {/* STAGE 2: CONFIRM DETAILS */}
        {stage === Stage.COMPANY_CONFIRM && (
           <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
               <h2 className="text-2xl font-serif font-bold mb-6">{t('step_confirm')}</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className={labelClasses}>{t('label_company')}</label>
                    <input className={inputClasses} value={formData.companyName || ''} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelClasses}>{t('label_website')}</label>
                    <input className={inputClasses} value={formData.websiteMetrics?.url || ''} onChange={e => setFormData({...formData, websiteMetrics: {...formData.websiteMetrics!, url: e.target.value}})} />
                  </div>
                  <div>
                    <label className={labelClasses}>{t('label_employees')}</label>
                    <input className={inputClasses} value={formData.operationalMetrics?.teamSize || ''} onChange={e => setFormData({...formData, operationalMetrics: {...formData.operationalMetrics!, teamSize: e.target.value}})} />
                  </div>
                  <div>
                    <label className={labelClasses}>{t('label_revenue')} ({currentCountry.currency.code})</label>
                    <input 
                      className={inputClasses} 
                      placeholder={formatCurrency(1000000)}
                      value={formData.financialMetrics?.annualRevenue || ''} 
                      onChange={e => setFormData({...formData, financialMetrics: {...formData.financialMetrics!, annualRevenue: e.target.value}})} 
                    />
                  </div>
               </div>
               <Button fullWidth onClick={() => setStage(Stage.TAXONOMY)}>{t('btn_review')}</Button>
           </div>
        )}

        {/* STAGE 3: TAXONOMY */}
        {stage === Stage.TAXONOMY && (
           <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
              <h2 className="text-2xl font-serif font-bold mb-2">{t('step_taxonomy')}</h2>
              <p className="text-muted-foreground mb-6">Define your playing field.</p>
              
              <div className="space-y-6 mb-8">
                <div>
                   <label className={labelClasses}>{t('label_industry')}</label>
                   <select className={inputClasses} value={selectedIndustry} onChange={e => {setSelectedIndustry(e.target.value); setSelectedSubIndustry(''); setSelectedNiche('');}}>
                      <option value="">{t('opt_select_industry')}</option>
                      {getIndustries().map(i => <option key={i} value={i}>{i}</option>)}
                   </select>
                </div>
                
                {selectedIndustry && (
                  <div className="animate-fadeIn">
                     <label className={labelClasses}>{t('label_sub_industry')}</label>
                     <select className={inputClasses} value={selectedSubIndustry} onChange={e => {setSelectedSubIndustry(e.target.value); setSelectedNiche('');}}>
                       <option value="">{t('opt_select_sub')}</option>
                       {getSubIndustries(selectedIndustry).map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                  </div>
                )}

                {selectedSubIndustry && (
                   <div className="animate-fadeIn">
                     <label className={labelClasses}>{t('label_niche')}</label>
                     <select className={inputClasses} value={selectedNiche} onChange={e => setSelectedNiche(e.target.value)}>
                       <option value="">{t('opt_select_niche')}</option>
                       {getNiches(selectedIndustry, selectedSubIndustry).map(n => <option key={n} value={n}>{n}</option>)}
                     </select>
                   </div>
                )}
              </div>
              <Button fullWidth disabled={!selectedNiche} onClick={handleTaxonomyComplete}>{t('btn_next')}</Button>
           </div>
        )}

        {/* STAGE 4: LOADING */}
        {stage === Stage.QUESTIONS_LOADING && (
           <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary mb-4"></div>
              <h3 className="text-lg font-bold">{t('msg_generating')}</h3>
           </div>
        )}

        {/* STAGE 5: MCQ QUESTIONS */}
        {stage === Stage.MCQ_QUESTIONS && questions.length > 0 && (
           <MCQQuestion 
              question={questions[currentQuestionIndex]}
              index={currentQuestionIndex}
              total={questions.length}
              onAnswer={handleMCQAnswer}
              onBack={handleBackQuestion}
              initialAnswer={formData.dynamicAnswers?.find(a => a.questionId === questions[currentQuestionIndex].id)?.answer}
           />
        )}

        {/* STAGE 7: CONTACT FORM */}
        {stage === Stage.CONTACT_FORM && (
           <div className="bg-card rounded-2xl shadow-xl p-8 border border-border text-center">
              <h2 className="text-3xl font-serif font-bold mb-4">{t('step_contact')}</h2>
              <div className="space-y-6 max-w-md mx-auto mb-8 text-left">
                  <div>
                    <label className={labelClasses}>{t('label_name')}</label>
                    <input className={inputClasses} value={formData.founderName} onChange={e => setFormData({...formData, founderName: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelClasses}>{t('label_email')}</label>
                    <input className={inputClasses} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelClasses}>{t('label_title')}</label>
                    <input className={inputClasses} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  </div>
              </div>
              <Button fullWidth onClick={handleFinalSubmit} disabled={!formData.email}>{t('btn_submit')}</Button>
           </div>
        )}
      </div>
    </div>
  );
};
