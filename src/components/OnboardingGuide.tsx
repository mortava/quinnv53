import React, { useState } from 'react';
import { X, ChevronRight, Check, BookOpen, Briefcase, Mic, Search } from 'lucide-react';

const steps = [
  {
    title: "Welcome to Quinn",
    description: "Your AI agent built by faith and powered by TQL. Quinn is designed to be your ultimate sales hub and daily assistant.",
    icon: <Search className="w-12 h-12 text-navy-600 mb-4" />
  },
  {
    title: "Knowledge Base & Search",
    description: "Quinn is connected directly to TQL's underwriting guidelines. Ask anything about DSCR, Non-QM, or matrices. Quinn also has Google Search built-in!",
    icon: <BookOpen className="w-12 h-12 text-navy-600 mb-4" />
  },
  {
    title: "Generative UI",
    description: "Quinn doesn't just return text. Ask Quinn to 'Create a deal', 'Draft an email', or 'Show the leaderboard' to see interactive components.",
    icon: <Briefcase className="w-12 h-12 text-navy-600 mb-4" />
  },
  {
    title: "Voice & Documents",
    description: "Click the microphone to speak your requests, or use the paperclip to upload documents (PDF, CSV, etc.) for Quinn to analyze instantly.",
    icon: <Mic className="w-12 h-12 text-navy-600 mb-4" />
  }
];

export function OnboardingGuide({ onClose }: { onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="font-bold text-navy-900">Getting Started</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20}/>
          </button>
        </div>
        
        <div className="p-8 flex flex-col items-center text-center min-h-[280px] justify-center">
          {steps[currentStep].icon}
          <h3 className="text-2xl font-bold text-navy-900 mb-3">{steps[currentStep].title}</h3>
          <p className="text-gray-600 leading-relaxed">{steps[currentStep].description}</p>
        </div>
        
        <div className="bg-gray-50 p-5 flex items-center justify-between border-t border-gray-100">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-navy-600' : 'w-2 bg-gray-300'}`} 
              />
            ))}
          </div>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button 
                onClick={() => setCurrentStep(p => p - 1)} 
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Back
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button 
                onClick={() => setCurrentStep(p => p + 1)} 
                className="px-5 py-2 text-sm font-bold bg-navy-600 text-white rounded-lg flex items-center gap-1 hover:bg-navy-700 transition-colors shadow-sm"
              >
                Next <ChevronRight size={16}/>
              </button>
            ) : (
              <button 
                onClick={onClose} 
                className="px-5 py-2 text-sm font-bold bg-emerald-600 text-white rounded-lg flex items-center gap-1 hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Get Started <Check size={16}/>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
