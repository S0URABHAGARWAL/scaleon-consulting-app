
import React, { useState } from 'react';
import { DynamicQuestion } from '../types';
import { Button } from './Button';

interface MCQQuestionProps {
  question: DynamicQuestion;
  index: number;
  total: number;
  onAnswer: (answer: string[]) => void;
  onBack: () => void;
  initialAnswer?: string[] | string;
}

export const MCQQuestion: React.FC<MCQQuestionProps> = ({ 
  question, index, total, onAnswer, onBack, initialAnswer 
}) => {
  // Normalize initial answer to array
  const [selected, setSelected] = useState<string[]>(
    Array.isArray(initialAnswer) ? initialAnswer : initialAnswer ? [initialAnswer] : []
  );

  const handleToggle = (optionLabel: string) => {
    if (question.type === 'single') {
      setSelected([optionLabel]);
    } else {
      if (selected.includes(optionLabel)) {
        setSelected(selected.filter(s => s !== optionLabel));
      } else {
        setSelected([...selected, optionLabel]);
      }
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-xl overflow-hidden max-w-2xl mx-auto border border-border flex flex-col min-h-[600px] animate-fadeIn">
      {/* Header */}
      <div className="bg-muted/30 p-6 border-b border-border">
        <div className="flex justify-between items-center mb-2">
           <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded">
             {question.category}
           </span>
           <span className="text-xs font-mono text-muted-foreground">
             Q{index + 1} of {total}
           </span>
        </div>
        <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground leading-snug">
          {question.text}
        </h2>
      </div>

      {/* Context Hint */}
      <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex items-start gap-2">
         <span className="text-blue-500 mt-0.5">ℹ️</span>
         <p className="text-xs text-blue-700 font-medium italic">
           {question.context}
         </p>
      </div>

      {/* Options */}
      <div className="p-6 flex-grow space-y-3 overflow-y-auto">
        {question.options.map((opt) => {
          const isSelected = selected.includes(opt.label);
          return (
            <div 
              key={opt.id}
              onClick={() => handleToggle(opt.label)}
              className={`
                relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group
                ${isSelected 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'}
              `}
            >
              <div className="flex items-start gap-4">
                 <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors
                    ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'}
                 `}>
                    {isSelected && <span className="text-white text-xs">✓</span>}
                 </div>
                 <div>
                    <div className={`font-bold text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                       {opt.label}
                    </div>
                    {opt.description && (
                       <div className="text-xs text-muted-foreground mt-1 group-hover:text-foreground/80 transition-colors">
                          {opt.description}
                       </div>
                    )}
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className="p-6 border-t border-border bg-muted/10 flex justify-between gap-4">
         <Button 
            variant="outline" 
            onClick={onBack}
            disabled={index === 0}
         >
           Back
         </Button>
         <div className="flex-grow"></div>
         <Button 
           onClick={() => onAnswer(selected)} 
           disabled={selected.length === 0}
           className="px-8"
         >
           Next Question
         </Button>
      </div>
    </div>
  );
};
