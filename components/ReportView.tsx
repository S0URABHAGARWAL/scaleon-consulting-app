
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from './Button';
import { StrategicReport, ProspectData, SWOTItem, AspectRatio } from '../types';
import { IntegrationService } from '../services/integrationService';
import { ChatWidget } from './ChatWidget';
import { useLanguage } from '../context/LanguageContext';
import { generateStrategicImage } from '../services/geminiService';

interface ReportViewProps {
  report: StrategicReport;
  prospectData: ProspectData;
  onSubmit: () => void;
}

const MarkdownRenderer = ({ content }: { content: string }) => {
  if (!content) return null;
  return (
    <div className="markdown-prose text-sm text-slate-600 leading-relaxed font-sans">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <span className="relative group cursor-help inline-block">
    <span className="underline decoration-dotted decoration-slate-400 underline-offset-2 hover:text-primary hover:decoration-primary transition-colors">
        {children}
    </span>
    <span className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl z-50 pointer-events-none text-center leading-normal border border-slate-700">
      {text}
      <svg className="absolute text-slate-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
          <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
      </svg>
    </span>
  </span>
);

const MetricCard = ({ label, value, color = "blue", tooltip }: { label: string, value: string | number, color?: string, tooltip?: string }) => (
  <div className="text-center p-6 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
    <div className={`text-4xl font-black text-${color}-600 mb-2 font-mono tracking-tighter`}>{value}</div>
    <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
      {tooltip ? <Tooltip text={tooltip}>{label}</Tooltip> : label}
    </div>
  </div>
);

const SVGBarChart = ({ values, labels }: { values: number[], labels: string[] }) => {
    const max = Math.max(...values, 100);
    return (
        <div className="flex items-end justify-center space-x-8 h-48 w-full px-8 mt-6">
            {values.map((v, i) => (
                <div key={i} className="flex flex-col items-center w-24 group relative">
                    <div className="absolute bottom-full mb-2 text-xs font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-200 bg-white px-2 py-1 rounded shadow-sm border border-slate-100">
                      {v}
                    </div>
                    <div 
                        className="w-12 bg-gradient-to-t from-primary/80 to-blue-400 rounded-t-lg transition-all duration-1000 ease-out group-hover:opacity-100 opacity-90 shadow-lg group-hover:w-14"
                        style={{ height: `${(v / max) * 100}%`, minHeight: '12px' }}
                    ></div>
                    <div className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{labels[i]}</div>
                </div>
            ))}
        </div>
    );
};

const RadarChart = ({ data, labels }: { data: number[], labels: string[] }) => {
  const size = 220;
  const center = size / 2;
  const radius = 70;
  
  const points = data.map((val, i) => {
    const angle = (Math.PI / 2) * i - Math.PI / 2;
    const x = center + (radius * (val / 100)) * Math.cos(angle);
    const y = center + (radius * (val / 100)) * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  const axes = labels.map((_, i) => {
    const angle = (Math.PI / 2) * i - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x1: center, y1: center, x2: x, y2: y };
  });

  const labelPositions = labels.map((label, i) => {
    const angle = (Math.PI / 2) * i - Math.PI / 2;
    const dist = radius + 25;
    const x = center + dist * Math.cos(angle);
    const y = center + dist * Math.sin(angle);
    const anchor = i === 1 ? 'start' : i === 3 ? 'end' : 'middle';
    return { x, y, label, anchor };
  });

  return (
    <div className="flex justify-center my-6 relative">
      <svg width={size} height={size + 20} className="overflow-visible">
        {/* Background Grids */}
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <circle key={scale} cx={center} cy={center} r={radius * scale} fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
        ))}
        {axes.map((line, i) => (
          <line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="#e2e8f0" strokeWidth="1" />
        ))}
        {/* The Shape */}
        <polygon points={points} fill="rgba(37, 99, 235, 0.1)" stroke="#2563EB" strokeWidth="2.5" className="drop-shadow-sm" />
        {/* Points */}
        {data.map((val, i) => {
          const angle = (Math.PI / 2) * i - Math.PI / 2;
          const x = center + (radius * (val / 100)) * Math.cos(angle);
          const y = center + (radius * (val / 100)) * Math.sin(angle);
          return (
            <g key={i} className="group">
                <circle cx={x} cy={y} r="4" fill="#fff" stroke="#2563EB" strokeWidth="2" className="group-hover:r-6 transition-all cursor-pointer" />
                <title>{labels[i]}: {val}</title>
            </g>
          );
        })}
        {/* Labels */}
        {labelPositions.map((l, i) => (
          <text 
            key={i} 
            x={l.x} 
            y={l.y} 
            textAnchor={l.anchor as any} 
            fontSize="9" 
            fontWeight="700" 
            fill="#64748B" 
            className="uppercase tracking-wider"
          >
            {l.label}
          </text>
        ))}
      </svg>
    </div>
  );
};

const SWOTGrid = ({ items, title, color }: { items: SWOTItem[], title: string, color: string }) => (
    <div className={`bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-lg hover:border-${color}-200 transition-all duration-300 group`}>
        <h4 className={`text-slate-800 font-serif font-bold text-lg mb-4 flex items-center gap-2`}>
            <span className={`w-2 h-8 rounded-full bg-${color}-500 group-hover:h-4 transition-all`}></span>
            {title}
        </h4>
        <ul className="space-y-4">
            {items.map((item, i) => (
                <li key={i} className="text-sm text-slate-700">
                    <span className="font-semibold block mb-1">{item.text}</span>
                    <span className={`text-${color}-600 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 opacity-70`}>
                       ACTION: {item.actionItem}
                    </span>
                </li>
            ))}
        </ul>
    </div>
);

export const ReportView: React.FC<ReportViewProps> = ({ report, prospectData, onSubmit }) => {
  const { t } = useLanguage();
  const [isSuccess, setIsSuccess] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  
  // Dynamic Image State
  const [visuals, setVisuals] = useState<{header?: string, roadmap?: string, market?: string}>({});
  const [loadingVisual, setLoadingVisual] = useState<string | null>(null);

  const handleBookCall = () => {
      IntegrationService.submitLeadAndFinalize(prospectData, report);
      setIsSuccess(true);
  };

  const handleExport = (format: 'docx' | 'ppt') => {
    setExporting(format);
    setTimeout(() => {
      setExporting(null);
      alert(`Report exported to ${format.toUpperCase()} successfully! (Simulation)`);
    }, 1500);
  };

  const generateSectionVisual = async (section: 'header' | 'market' | 'roadmap') => {
     setLoadingVisual(section);
     let prompt = "";
     let ratio: AspectRatio = "16:9";
     
     if (section === 'header') {
         prompt = `A cinematic, abstract business concept image representing: ${report.executiveSummary.slice(0, 50)}... corporate style, high quality.`;
     } else if (section === 'market') {
         prompt = `A data visualization style infographic 3d render showing market growth and opportunity for ${prospectData.industry} industry. Clean, modern, blue tones.`;
         ratio = "16:9";
     } else if (section === 'roadmap') {
         prompt = `A strategic roadmap visualization, milestones, journey, success, corporate vector style art, white background.`;
         ratio = "16:9";
     }

     try {
        const img = await generateStrategicImage(prompt, ratio);
        if (img) setVisuals(prev => ({...prev, [section]: img}));
     } catch(e) { console.error(e); } 
     finally { setLoadingVisual(null); }
  };

  if (isSuccess) {
      return (
          <div className="flex items-center justify-center min-h-[60vh] bg-slate-50">
             <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center border border-slate-100">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                   <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-3xl font-serif font-bold mb-4 text-slate-900">{t('msg_thank_you')}</h2>
                <p className="text-slate-600 mb-8 leading-relaxed">{t('msg_report_generated')}</p>
                <Button onClick={() => window.location.reload()} variant="outline">{t('msg_return_home')}</Button>
             </div>
          </div>
      );
  }

  return (
    <div className="flex-grow bg-slate-50 pb-24 animate-fadeIn">
      {/* HERO HEADER */}
      <div className="bg-white border-b border-slate-200 shadow-sm relative overflow-hidden group">
        {visuals.header ? (
           <div className="absolute inset-0">
              <img src={visuals.header} alt="Strategic Context" className="w-full h-full object-cover opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-white/50"></div>
           </div>
        ) : (
           <div className="absolute top-4 right-4 z-20">
              <button 
                 onClick={() => generateSectionVisual('header')}
                 className="bg-white/80 backdrop-blur text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/20 shadow-sm hover:bg-white transition-all flex items-center gap-2"
              >
                  {loadingVisual === 'header' ? <span className="animate-spin">⟳</span> : <span>✦</span>}
                  {t('btn_generate_visuals')}
              </button>
           </div>
        )}

        <div className="max-w-6xl mx-auto px-6 py-16 relative z-10 text-center">
          <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full mb-6 uppercase tracking-widest border border-primary/20">
             {t('report_title')}
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-4 tracking-tight leading-tight">
             {prospectData.companyName}
          </h1>
          <p className="text-lg text-slate-500 font-medium font-sans">
             {t('report_subtitle')} <span className="text-slate-900 font-semibold">{prospectData.founderName}</span> • {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN (CONTENT) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. EXECUTIVE SUMMARY */}
          <section className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
             <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-3">
                   <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white text-sm font-bold">01</span>
                   {t('section_exec_summary')}
                 </h2>
             </div>
             
             <MarkdownRenderer content={report.executiveSummary} />
             
             {/* Key Strengths & Gaps */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
                   <h3 className="font-bold text-emerald-800 mb-4 text-xs uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {t('lbl_key_strengths')}
                   </h3>
                   <ul className="space-y-2">
                     {report.keyStrengths.map((s, i) => (
                        <li key={i} className="text-sm text-emerald-900 flex items-start gap-2">
                           <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                           {s}
                        </li>
                     ))}
                   </ul>
                </div>
                <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100">
                   <h3 className="font-bold text-rose-800 mb-4 text-xs uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      {t('lbl_crit_gaps')}
                   </h3>
                   <ul className="space-y-2">
                     {report.criticalGaps.map((g, i) => (
                        <li key={i} className="text-sm text-rose-900 flex items-start gap-2">
                           <svg className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                           {g}
                        </li>
                     ))}
                   </ul>
                </div>
             </div>
          </section>

          {/* 2. MARKET ANALYSIS */}
          <section className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden">
             <div className="flex justify-between items-start mb-8 relative z-10">
                <h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white text-sm font-bold">02</span>
                  {t('section_market_analysis')}
                </h2>
                {!visuals.market && (
                  <button onClick={() => generateSectionVisual('market')} className="text-primary hover:bg-primary/5 p-2 rounded-lg transition-colors" title={t('btn_generate_visuals')}>
                     {loadingVisual === 'market' ? <span className="animate-spin text-lg">⟳</span> : <span className="text-lg">✦</span>}
                  </button>
                )}
             </div>

             {visuals.market && (
                <div className="mb-8 rounded-xl overflow-hidden border border-slate-100 shadow-sm animate-fadeIn">
                   <img src={visuals.market} alt="Market Viz" className="w-full h-auto" />
                </div>
             )}
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
                <MetricCard label="TAM" value={report.marketAnalysis.tam} color="blue" tooltip={t('tooltip_tam')} />
                <MetricCard label="SAM" value={report.marketAnalysis.sam} color="blue" tooltip={t('tooltip_sam')} />
                <MetricCard label="SOM" value={report.marketAnalysis.som} color="blue" tooltip={t('tooltip_som')} />
             </div>
             
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center relative overflow-hidden">
                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">{t('lbl_market_size_viz')}</h4>
                 <SVGBarChart 
                   values={[report.marketAnalysis.tamValue, report.marketAnalysis.samValue, report.marketAnalysis.somValue]} 
                   labels={['TAM', 'SAM', 'SOM']} 
                 />
                 <p className="text-slate-500 italic text-sm mt-6 border-t border-slate-200 pt-4 max-w-lg mx-auto">
                    "{report.marketAnalysis.marketOutlook}"
                 </p>
             </div>
          </section>

          {/* 3. SWOT */}
          <section className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
             <h2 className="text-2xl font-serif font-bold text-slate-900 mb-8 flex items-center gap-3">
               <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500 text-white text-sm font-bold">03</span>
               {t('section_swot')}
             </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SWOTGrid title="Strengths" items={report.swot.strengths} color="emerald" />
                <SWOTGrid title="Weaknesses" items={report.swot.weaknesses} color="rose" />
                <SWOTGrid title="Opportunities" items={report.swot.opportunities} color="blue" />
                <SWOTGrid title="Threats" items={report.swot.threats} color="amber" />
             </div>
          </section>

          {/* 4. GROWTH ROADMAP */}
          <section className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-8">
                <h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-600 text-white text-sm font-bold">04</span>
                  <Tooltip text={t('tooltip_roadmap')}>{t('section_roadmap')}</Tooltip>
                </h2>
                {!visuals.roadmap && (
                  <button onClick={() => generateSectionVisual('roadmap')} className="text-primary hover:bg-primary/5 p-2 rounded-lg transition-colors" title={t('btn_generate_visuals')}>
                     {loadingVisual === 'roadmap' ? <span className="animate-spin text-lg">⟳</span> : <span className="text-lg">✦</span>}
                  </button>
                )}
             </div>

             {visuals.roadmap && (
                <div className="mb-10 rounded-xl overflow-hidden border border-slate-100 shadow-sm animate-fadeIn">
                   <img src={visuals.roadmap} alt="Roadmap Viz" className="w-full h-auto" />
                </div>
             )}
             
             <div className="space-y-10 relative pl-4">
                <div className="absolute left-[31px] top-6 bottom-6 w-0.5 bg-slate-200"></div>
                {[
                  { data: report.growthRoadmap.quickWins, label: 'Quick Wins', color: 'emerald' },
                  { data: report.growthRoadmap.strategic, label: 'Strategic Initiatives', color: 'blue' },
                  { data: report.growthRoadmap.longTerm, label: 'Long Term', color: 'purple' }
                ].map((phase, i) => (
                  <div key={i} className="relative pl-12">
                     <div className={`absolute left-0 top-0 w-16 h-16 rounded-2xl bg-white border-2 border-${phase.color}-200 flex flex-col items-center justify-center text-${phase.color}-600 font-bold z-10 shadow-sm`}>
                       <span className="text-lg leading-none">{i+1}</span>
                       <span className="text-[10px] uppercase">Phase</span>
                     </div>
                     
                     <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-4 border-b border-slate-100">
                           <div className="mb-2 sm:mb-0">
                              <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest bg-${phase.color}-50 text-${phase.color}-700 mb-2`}>
                                {phase.label}
                              </span>
                              <h3 className="font-bold text-xl text-slate-900">{phase.data.phaseName}</h3>
                           </div>
                           <div className="flex items-center gap-2 text-sm font-mono text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              {phase.data.duration}
                           </div>
                        </div>
                        <ul className="space-y-3 mb-5">
                           {phase.data.initiatives.map((init, idx) => (
                             <li key={idx} className="text-sm text-slate-700 flex items-start gap-3">
                               <span className={`text-${phase.color}-500 mt-1 font-bold text-lg leading-none`}>•</span>
                               <span>
                                 <strong className="text-slate-900">{init.title}</strong>
                                 <span className="block text-slate-500 text-xs mt-0.5">{init.impact}</span>
                               </span>
                             </li>
                           ))}
                        </ul>
                        <div className={`text-xs text-${phase.color}-700 font-medium bg-${phase.color}-50 p-3 rounded-lg flex items-start gap-2`}>
                           <span className="text-lg">🎯</span>
                           <span className="mt-0.5">Outcome: {phase.data.expectedOutcome}</span>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </section>

          {/* 5. AI TOOLS */}
          <section className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
             <h2 className="text-2xl font-serif font-bold text-slate-900 mb-8 flex items-center gap-3">
               <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white text-sm font-bold">05</span>
               <Tooltip text={t('tooltip_ai_tools')}>{t('section_ai_tools')}</Tooltip>
             </h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
               {report.aiTools.map((tool, i) => (
                 <div key={i} className="group p-5 bg-white border border-slate-200 rounded-xl hover:border-primary hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-start mb-3">
                       <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{tool.name}</h4>
                       <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-wider font-medium">{tool.category}</span>
                    </div>
                    <p className="text-xs text-slate-600 mb-4 leading-relaxed h-8 overflow-hidden line-clamp-2">{tool.description}</p>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 border-t border-slate-100 pt-3">
                       <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded">ROI: {tool.roiEstimate}</span>
                       <span>{tool.cost}</span>
                    </div>
                 </div>
               ))}
             </div>
          </section>

        </div>

        {/* RIGHT COLUMN (SIDEBAR) */}
        <div className="lg:col-span-4 space-y-6">
           
           {/* SCORES CARD */}
           <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 sticky top-24">
              <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-4 text-center">{t('lbl_score_title')}</h3>
              
              {/* RADAR CHART */}
              <div className="mb-6 bg-slate-50 rounded-2xl p-2 border border-slate-100">
                <RadarChart 
                  data={[report.healthScore, report.marketOpportunityScore, report.socialHealthScore, report.websitePerformanceIndex]}
                  labels={[
                      t('tooltip_health_score').split(' ')[0] || 'Health', 
                      'Market', 
                      'Social', 
                      'Web'
                  ]}
                />
              </div>
              
              <div className="text-center mb-8">
                <div className="relative inline-block">
                    <div className="text-6xl font-black text-slate-900 tracking-tighter">{report.healthScore}</div>
                    <div className="absolute top-0 -right-4 text-lg text-slate-400 font-medium">/100</div>
                </div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Overall Strategic Score</div>
              </div>

              {/* Risks Mini-Section */}
              <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 mb-6">
                 <h4 className="font-bold text-xs uppercase mb-3 text-rose-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Top Risks
                 </h4>
                 <ul className="space-y-3">
                    {report.risks.slice(0, 3).map((risk, i) => (
                       <li key={i} className="flex items-start gap-2 text-xs text-rose-900">
                          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${risk.severity === 'High' ? 'bg-red-500' : 'bg-orange-400'}`}></span>
                          <span className="leading-tight">{risk.riskName}</span>
                       </li>
                    ))}
                 </ul>
              </div>

              <div className="space-y-3">
                  <Button fullWidth onClick={handleBookCall} className="shadow-lg shadow-primary/20 py-4 text-sm">
                    {t('btn_book_call')}
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                     <button 
                       onClick={() => handleExport('docx')}
                       disabled={!!exporting}
                       className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary hover:border-primary/30 transition-all disabled:opacity-50"
                     >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                        {exporting === 'docx' ? '...' : t('btn_export_docx')}
                     </button>
                     <button 
                       onClick={() => handleExport('ppt')}
                       disabled={!!exporting}
                       className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary hover:border-primary/30 transition-all disabled:opacity-50"
                     >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        {exporting === 'ppt' ? '...' : t('btn_export_ppt')}
                     </button>
                  </div>

                  <button 
                     onClick={() => window.print()}
                     className="w-full mt-2 text-center text-xs text-slate-400 hover:text-slate-700 underline decoration-dotted"
                  >
                     {t('btn_save_pdf')}
                  </button>
              </div>
           </div>

        </div>
      </div>
      
      <ChatWidget />
    </div>
  );
};
