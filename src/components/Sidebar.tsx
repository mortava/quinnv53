import React from 'react';
import { MessageSquare, Briefcase, Mail, Lightbulb, X, Home, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentView: 'chat' | 'quote';
  onAction: (action: string) => void;
  onOpenOnboarding?: () => void;
}

export function Sidebar({ isOpen, setIsOpen, currentView, onAction }: SidebarProps) {
  const navItems = [
    { id: 'chat', icon: MessageSquare, label: 'Chat History' },
    { id: 'reset', icon: Trash2, label: 'Reset Chat' },
    { id: 'quote', icon: Home, label: 'Loan Quote' },
    { id: 'deal', icon: Briefcase, label: 'Create Deal' },
    { id: 'email', icon: Mail, label: 'Email Builder' },
    { id: 'ideas', icon: Lightbulb, label: 'Sales Ideas' },
  ];

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-40 w-[80vw] max-w-[320px] bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out pt-[env(safe-area-inset-top)]",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="h-16 flex flex-col justify-center px-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <span className="font-serif font-medium text-lg text-slate-400 tracking-tight leading-tight">Quinn</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-md text-slate-500 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 pb-[env(safe-area-inset-bottom)]">
          {navItems.map((item, index) => {
            const isActive =
              (item.id === 'chat' && currentView === 'chat') ||
              (item.id === 'quote' && currentView === 'quote');
            return (
              <button
                key={index}
                onClick={() => {
                  onAction(item.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px]",
                  isActive
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon size={18} className={isActive ? "text-slate-800" : "text-slate-400"} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
