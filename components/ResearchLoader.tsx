import React, { useEffect, useState } from 'react';

interface ResearchLoaderProps {
  prospectName: string;
}

export const ResearchLoader: React.FC<ResearchLoaderProps> = ({ prospectName }) => {
  const [stage, setStage] = useState(0);
  const stages = [
    `Analyzing ${prospectName}'s profile...`,
    "Searching industry benchmarks and trends...",
    "Identifying key growth inhibitors...",
    "Drafting strategic roadmap...",
    "Finalizing report..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStage(prev => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 2500); // Switch text every 2.5s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-grow flex flex-col items-center justify-center bg-white p-6">
      <div className="w-full max-w-md text-center">
        {/* Animated Icon */}
        <div className="relative w-24 h-24 mx-auto mb-8">
           <div className="absolute inset-0 border-4 border-brand-100 rounded-full"></div>
           <div className="absolute inset-0 border-4 border-accent-500 rounded-full border-t-transparent animate-spin"></div>
           <div className="absolute inset-0 flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-800 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
             </svg>
           </div>
        </div>

        <h3 className="text-xl font-serif font-bold text-brand-800 mb-2 transition-all duration-300">
          {stages[stage]}
        </h3>
        <p className="text-sm text-brand-400">ScaleOn AI Agent is working</p>
        
        {/* Progress bar */}
        <div className="mt-8 h-1.5 w-full bg-brand-50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent-500 transition-all duration-1000 ease-linear"
            style={{ width: `${((stage + 1) / stages.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};