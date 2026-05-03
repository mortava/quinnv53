import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, ChevronRight, Copy, ExternalLink, Bookmark } from 'lucide-react';
import { SourceRef } from '../types';
import { allChunks } from '../lib/knowledge_base';

interface GuidelineSourcePanelProps {
  source: SourceRef | null;
  onClose: () => void;
}

export function GuidelineSourcePanel({ source, onClose }: GuidelineSourcePanelProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!source) return null;

  const stripMarkdown = (text: string) => {
    return text
      .replace(/^#+\s+/gm, '') // Headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1') // Italic
      .replace(/__(.*?)__/g, '$1') // Underline/Bold
      .replace(/_(.*?)_/g, '$1') // Italic
      .trim();
  };

  const chunk = allChunks.find(c => c.sourceDocId === source.docId && c.section === source.sectionTitle);
  const rawContent = chunk?.content || "Full guideline content not available.";
  const content = stripMarkdown(rawContent);
  const highlightText = source.content ? stripMarkdown(source.content) : null;

  const handleCopyCitation = () => {
    const citation = `${source.sectionTitle} - ${source.docId} (Source Ref: ${source.sectionId})`;
    navigator.clipboard.writeText(citation);
  };

  return (
    <AnimatePresence>
      {source && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-all"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-[480px] md:max-w-[480px] bg-white shadow-2xl z-[51] flex flex-col border-l border-slate-200"
            role="dialog"
            aria-labelledby="panel-title"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-navy-600 rounded-lg text-white">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 id="panel-title" className="text-lg font-bold text-navy-900 leading-tight">Source Guideline</h2>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                    <span>{source.docId}</span>
                    <ChevronRight size={10} />
                    <span className="text-navy-600">{source.sectionTitle}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-200 shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8" style={{ paddingBottom: 'env(safe-area-inset-bottom, 2rem)' }}>
              {/* Breadcrumbs for clarity */}
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <Bookmark size={12} />
                <span>Guidelines</span>
                <ChevronRight size={12} />
                <span>{source.docId}</span>
                <ChevronRight size={12} />
                <span className="text-slate-600">{source.sectionTitle}</span>
              </div>

              {/* Main Text with Highlighting */}
              <div className="prose prose-slate max-w-none">
                <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm leading-relaxed whitespace-pre-wrap text-slate-700 font-medium">
                  {/* We apply a subtle highlight if highlightText is provided */}
                  {highlightText ? (
                    (() => {
                      const parts = content.split(highlightText);
                      if (parts.length > 1) {
                        return (
                          <>
                            {parts[0]}
                            <span className="bg-yellow-100 px-1 rounded-sm ring-1 ring-yellow-200 text-slate-900 border-b-2 border-yellow-300 font-semibold">{highlightText}</span>
                            {parts[1]}
                          </>
                        );
                      }
                      return content;
                    })()
                  ) : content}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
              <button 
                onClick={handleCopyCitation}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm group"
              >
                <Copy size={16} className="text-slate-400 group-hover:text-navy-600 transition-colors" />
                Copy Citation
              </button>
              <button 
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-navy-900 rounded-xl text-sm font-bold text-white hover:bg-navy-800 transition-all shadow-md group"
              >
                <ExternalLink size={16} className="text-navy-300 group-hover:text-white transition-colors" />
                Full Document
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
