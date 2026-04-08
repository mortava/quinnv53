import React from 'react';
import { MessageSquare, Briefcase, Mail, Trophy, Lightbulb, X, Menu, HelpCircle, Home, Search, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onOpenOnboarding: () => void;
  onAction: (action: string) => void;
  currentView: 'chat' | 'quote';
}

export function Sidebar({ isOpen, setIsOpen, onOpenOnboarding, onAction, currentView }: SidebarProps) {
  const navItems = [
    { id: 'chat', icon: MessageSquare, label: 'Chat History' },
    { id: 'reset', icon: Trash2, label: 'Reset Chat' },
    { id: 'quote', icon: Home, label: 'Loan Quote', disabled: true },
    { id: 'deal', icon: Briefcase, label: 'Create Deal', disabled: true },
    { id: 'email', icon: Mail, label: 'Email Builder', disabled: true },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="h-20 flex flex-col justify-center px-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <div className="relative">
                  <span className="font-serif font-medium text-lg text-slate-400 tracking-tight leading-tight">Quınn</span>
                  <div className="absolute top-[18%] left-[58%] w-1 h-1 bg-sky-500 rounded-full shadow-[0_0_6px_rgba(14,165,233,0.8)] animate-pulse" />
                </div>
                <span className="font-sans font-bold text-base text-navy-900 tracking-tight leading-tight">Actions HUB</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-md text-slate-500 hover:bg-slate-100 md:hidden transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item, index) => {
              const isActive = currentView === item.id || (currentView === 'chat' && item.id === 'chat');
              return (
                <button
                  key={index}
                  disabled={item.disabled}
                  onClick={() => {
                    if (item.disabled) return;
                    onAction(item.id);
                    if (window.innerWidth < 768) setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    item.disabled 
                      ? "opacity-40 grayscale cursor-not-allowed"
                      : isActive 
                        ? "bg-slate-100 text-slate-900" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon size={18} className={isActive && !item.disabled ? "text-slate-800" : "text-slate-400"} />
                  {item.label}
                </button>
              );
            })}
            
          </nav>
        </div>
      </div>
    </>
  );
}
