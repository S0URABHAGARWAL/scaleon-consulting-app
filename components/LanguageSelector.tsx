
import React, { useState } from 'react';
import { useLanguage, COUNTRIES } from '../context/LanguageContext';
import { Button } from './Button';
import { Country, Language } from '../types';

interface LanguageSelectorProps {
  onComplete: () => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onComplete }) => {
  const { currentCountry, setCountry, currentLanguage, setLanguage, formatCurrency, getLanguageFlag } = useLanguage();
  const [step, setStep] = useState<'country' | 'language'>('country');

  const handleCountrySelect = (c: Country) => {
    setCountry(c);
    setStep('language');
  };

  return (
    <div className="flex flex-col items-center justify-start pt-12 pb-24 px-4 sm:px-6 lg:px-8 animate-fadeIn max-w-5xl mx-auto min-h-[80vh]">
      
      {/* HEADER */}
      <div className="text-center mb-12 max-w-2xl">
        <h2 className="text-primary font-bold uppercase tracking-widest text-xs mb-3">
          Step 1: Localization
        </h2>
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-4 leading-tight">
          {step === 'country' ? "Where is your business based?" : "Which language do you prefer?"}
        </h1>
        <p className="text-lg text-gray-500">
          {step === 'country' 
            ? "We will customize currency, metrics, and benchmarks for your region." 
            : `Select a language supported in ${currentCountry.name}.`
          }
        </p>
      </div>

      {/* STEP 1: COUNTRY SELECTION */}
      {step === 'country' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full animate-slideUp">
          {COUNTRIES.map((country) => (
            <button
              key={country.code}
              onClick={() => handleCountrySelect(country)}
              className={`
                flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 ease-out text-center group
                ${currentCountry.code === country.code
                  ? 'border-primary bg-primary/5 shadow-xl scale-105 ring-2 ring-primary ring-offset-2'
                  : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-lg hover:-translate-y-1'
                }
              `}
            >
              <span className="text-6xl mb-4 filter drop-shadow-sm group-hover:scale-110 transition-transform">{country.flag}</span>
              <span className="text-xl font-bold text-gray-900">{country.name}</span>
              <div className="mt-4 flex gap-2 text-xs font-mono text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                <span>{country.currency.code}</span>
                <span>•</span>
                <span>{country.currency.symbol}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* STEP 2: LANGUAGE SELECTION */}
      {step === 'language' && (
        <div className="w-full max-w-3xl animate-slideUp">
           {/* Selected Country Context */}
           <div 
             className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-8 cursor-pointer hover:border-primary/50 transition-all flex items-center gap-6"
             onClick={() => setStep('country')}
           >
              <div className="text-6xl filter drop-shadow-sm">{currentCountry.flag}</div>
              <div className="flex-grow">
                 <div className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-1">Selected Region</div>
                 <div className="text-2xl font-serif font-bold text-gray-900">{currentCountry.name}</div>
              </div>
              <div className="text-primary text-sm font-bold underline decoration-2 hover:text-primary/80">Change</div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentCountry.languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang)}
                  className={`
                    relative flex items-center p-4 rounded-xl border-2 transition-all duration-200
                    ${currentLanguage.code === lang.code
                      ? 'border-primary bg-primary text-white shadow-lg'
                      : 'border-gray-200 bg-white text-gray-900 hover:border-primary/50'
                    }
                  `}
                >
                  <span className="text-3xl mr-4">{getLanguageFlag(lang.code)}</span>
                  <div className="flex-grow text-left">
                    <div className="font-bold text-lg">{lang.nativeName}</div>
                    <div className={`text-sm ${currentLanguage.code === lang.code ? 'text-blue-100' : 'text-gray-500'}`}>{lang.name}</div>
                  </div>
                  {currentLanguage.code === lang.code && (
                    <div className="bg-white text-primary rounded-full p-1 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
           </div>

           {/* Preview Card */}
           <div className="mt-12 bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
              <p className="text-xs font-bold uppercase text-gray-400 tracking-widest mb-2">Localization Preview</p>
              <div className="text-2xl font-serif text-gray-900 mb-1">
                 {formatCurrency(5000000)} Revenue
              </div>
              <div className="text-sm text-gray-500">
                 Formatted for {currentCountry.name} in {currentLanguage.name}
              </div>
           </div>

           {/* Action Bar */}
           <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-md border border-white/20 p-2 rounded-full shadow-2xl pointer-events-auto transform transition-all hover:scale-105">
              <Button 
                onClick={onComplete} 
                className="rounded-full px-12 py-4 text-lg font-bold shadow-primary/30"
              >
                Start Discovery →
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
