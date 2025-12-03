
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export const Header: React.FC = () => {
  const { t } = useLanguage();
  const [customLogo, setCustomLogo] = useState<string | null>(null);

  useEffect(() => {
    const storedLogo = localStorage.getItem('scaleon_custom_logo');
    if (storedLogo) {
      setCustomLogo(storedLogo);
    }
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCustomLogo(result);
        localStorage.setItem('scaleon_custom_logo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-50 shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <label 
          className="flex items-center gap-4 cursor-pointer group relative" 
          title={t('tooltip_upload_logo')}
        >
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleLogoUpload} 
          />
          
          <div className="relative w-12 h-12 flex-shrink-0 bg-slate-50 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors overflow-hidden">
            {customLogo ? (
              <img src={customLogo} alt="Company Logo" className="w-full h-full object-contain p-1" />
            ) : (
              <>
                 <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                 </svg>
                 <span className="text-[9px] font-bold uppercase leading-none">{t('header_upload_text')}</span>
              </>
            )}
            
            {/* Upload Overlay on Hover */}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
               </svg>
            </div>
          </div>
          
          <div className="flex flex-col" onClick={(e) => { e.preventDefault(); window.location.reload(); }}>
            <span className="font-serif font-bold text-2xl leading-none tracking-tight text-slate-900 group-hover:text-primary transition-colors">
              ScaleOn
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold">
              Consulting
            </span>
          </div>
        </label>
        
        <nav className="hidden md:flex items-center gap-6">
          <span className="px-4 py-1.5 rounded-full bg-slate-50 text-slate-600 text-xs font-bold tracking-wider uppercase border border-slate-200">
            Strategic Discovery
          </span>
        </nav>
      </div>
    </header>
  );
};
