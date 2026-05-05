import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Panel — large iframe, 4px inset on all sides */}
      <div className="relative m-3 flex flex-col flex-1 bg-white rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-5 h-12 border-b border-black/8 bg-[#0D0D0D] shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#245F73] animate-pulse" />
            <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest">TQL Pricer</span>
            <span className="text-[11px] text-white/20">·</span>
            <span className="text-[11px] text-white/30">submit.tqltpo.com</span>
          </div>
          <div className="flex items-center gap-1">
            <a
              href="https://submit.tqltpo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-white/30 hover:text-white/70 transition-colors rounded-lg hover:bg-white/5"
              title="Open in new tab"
            >
              <ExternalLink size={15} />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-white/30 hover:text-white/70 transition-colors rounded-lg hover:bg-white/5"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Iframe */}
        <div className="flex-1 relative bg-[#F5F5F0]">
          <iframe
            src="https://submit.tqltpo.com"
            className="w-full h-full border-none"
            title="TQL Pricing Engine"
            allow="clipboard-write"
          />
        </div>
      </div>
    </div>
  );
}

export default PricingModal;
