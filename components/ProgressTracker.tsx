
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface ProgressTrackerProps {
  currentStage: number; // 0 to 100
  stageName: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ currentStage, stageName }) => {
  const { t } = useLanguage();
  const [elapsed, setElapsed] = useState(0);
  const [estimatedRemaining, setEstimatedRemaining] = useState(300); // 5 mins default

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(e => e + 1);
      setEstimatedRemaining(prev => Math.max(0, prev - 0.5)); 
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed top-20 left-0 right-0 z-40 px-4 print:hidden pointer-events-none">
      <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-md shadow-lg rounded-full border border-white/50 p-3 flex items-center gap-5 pointer-events-auto transition-all duration-500 hover:shadow-xl hover:scale-[1.01]">
        
        {/* Progress Circle with Tooltip */}
        <div className="relative w-12 h-12 flex-shrink-0 group cursor-help">
           <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
              <path 
                className="text-primary transition-all duration-1000 ease-out" 
                strokeDasharray={`${currentStage}, 100`} 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
              />
           </svg>
           <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-800 transition-all duration-300">
             {Math.round(currentStage)}%
           </div>
           
           {/* Enhanced Tooltip */}
           <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-40 p-3 bg-gray-900 text-white text-xs rounded-xl text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-gray-700">
             <div className="font-bold mb-1">{t('tracker_current_phase')}</div>
             <div className="text-gray-300">{stageName}</div>
             <svg className="absolute text-gray-900 h-2 w-full left-0 bottom-full" x="0px" y="0px" viewBox="0 0 255 255">
                <polygon className="fill-current" points="0,255 127.5,127.5 255,255"/>
             </svg>
           </div>
        </div>

        {/* Info */}
        <div className="flex-grow min-w-0 flex flex-col justify-center">
           <div className="text-[10px] font-bold uppercase text-primary tracking-widest mb-0.5 opacity-80">{t('tracker_current_phase')}</div>
           <div className="font-serif font-bold text-gray-900 truncate text-lg leading-tight animate-fadeIn" key={stageName}>
             {stageName}
           </div>
        </div>

        {/* Timer */}
        <div className="hidden sm:flex flex-col items-end text-right border-l border-gray-200 pl-4 h-8 justify-center">
           <div className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">{t('tracker_elapsed')}</div>
           <div className="font-mono font-bold text-gray-700 text-sm">{formatTime(elapsed)}</div>
        </div>
        <div className="hidden sm:flex flex-col items-end text-right border-l border-gray-200 pl-4 h-8 justify-center">
           <div className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">{t('tracker_est_remain')}</div>
           <div className="font-mono font-bold text-accent text-sm">{formatTime(estimatedRemaining)}</div>
        </div>
      </div>
    </div>
  );
};
