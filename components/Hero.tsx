import React from 'react';
import { Button } from './Button';

interface HeroProps {
  onStart: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="flex-grow flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Decor using new Brand Colors */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-secondary/5 blur-3xl"></div>

      <div className="max-w-4xl mx-auto px-6 py-16 text-center relative z-10">
        <span className="inline-block py-1.5 px-4 rounded-full bg-muted text-primary text-xs font-bold tracking-widest uppercase mb-6 border border-border shadow-sm">
          ScaleOn Consulting Pre-Vetting Tool
        </span>
        
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
          Let's understand your business <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            Before we build your strategy.
          </span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed font-sans">
          Welcome. I am your ScaleOn Strategy Assistant. I will guide you through a few simple questions to understand your goals and challenges. This allows our senior partners to come prepared with a deep roadmap for your success.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={onStart} className="text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all font-sans">
            Start Conversation
          </Button>
        </div>
        
        <div className="mt-12 flex items-center justify-center space-x-8 text-muted-foreground font-sans">
          <div className="flex items-center gap-2">
            <span className="bg-secondary/10 text-secondary p-1.5 rounded-full">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
               </svg>
            </span>
            <span className="text-sm font-medium">Confidential</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-accent/10 text-accent p-1.5 rounded-full">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
               </svg>
            </span>
            <span className="text-sm font-medium">Deep AI Research</span>
          </div>
          <div className="flex items-center gap-2">
             <span className="bg-primary/10 text-primary p-1.5 rounded-full">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
               </svg>
            </span>
            <span className="text-sm font-medium">Multilingual Support</span>
          </div>
        </div>
      </div>
    </div>
  );
};