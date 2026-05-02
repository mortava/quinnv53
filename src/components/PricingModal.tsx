import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <div
        className="relative w-full max-w-6xl h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300"
      >
            {/* Header */}
            <div className="flex items-center justify-end px-6 py-4 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-2">
                <a 
                  href="https://submit.tqltpo.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 text-slate-400 hover:text-navy-600 hover:bg-slate-50 rounded-full transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink size={20} />
                </a>
                <button 
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Close"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Iframe Content */}
            <div className="flex-1 bg-slate-50 relative">
              <iframe 
                src="https://submit.tqltpo.com" 
                className="w-full h-full border-none"
                title="TQL Pricing Engine"
                allow="clipboard-write"
              />
            </div>
            
            {/* Footer / Status Bar */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Secure Connection Active</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span>Live Data Sync</span>
              </div>
            </div>
        </div>
    </div>
  );
}
