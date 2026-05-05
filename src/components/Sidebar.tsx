import React from 'react';
import { MessageSquare, Home, Mail, Lightbulb, X, Trash2, Calculator, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentView: 'chat' | 'quote';
  onAction: (action: string) => void;
  onOpenOnboarding?: () => void;
}

const navItems = [
  { id: 'chat',  icon: MessageSquare, label: 'Deal Desk' },
  { id: 'quote', icon: Home,          label: 'Loan Quote' },
  { id: 'email', icon: Mail,          label: 'Email Builder' },
  { id: 'ideas', icon: Lightbulb,     label: 'Sales Ideas' },
];

const utilItems = [
  { id: 'reset', icon: RefreshCw, label: 'New Session' },
  { id: 'deal',  icon: Calculator, label: 'Pricer' },
];

export function Sidebar({ isOpen, setIsOpen, currentView, onAction }: SidebarProps) {
  const handleNav = (id: string) => {
    onAction(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Desktop: always visible static sidebar */}
      <aside className="hidden md:flex flex-col w-[220px] shrink-0 bg-[#0D0D0D] h-screen">
        <SidebarContent currentView={currentView} onNav={handleNav} showClose={false} onClose={() => {}} />
      </aside>

      {/* Mobile: slide-in overlay */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-[220px] bg-[#0D0D0D] flex flex-col transform transition-transform duration-300 ease-in-out md:hidden pt-[env(safe-area-inset-top)]",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent currentView={currentView} onNav={handleNav} showClose onClose={() => setIsOpen(false)} />
      </aside>
    </>
  );
}

function SidebarContent({
  currentView,
  onNav,
  showClose,
  onClose,
}: {
  currentView: 'chat' | 'quote';
  onNav: (id: string) => void;
  showClose: boolean;
  onClose: () => void;
}) {
  return (
    <div className="h-full flex flex-col">
      {/* Wordmark */}
      <div className="h-14 flex items-center justify-between px-5 border-b border-white/5">
        <div>
          <span className="text-white text-[13px] font-bold tracking-widest uppercase">TQL</span>
          <span className="text-[#245F73] text-[13px] font-bold tracking-widest uppercase ml-1.5">Quinn</span>
        </div>
        {showClose && (
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Section label */}
      <div className="px-5 pt-6 pb-2">
        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Workspace</span>
      </div>

      {/* Primary nav */}
      <nav className="px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            (item.id === 'chat' && currentView === 'chat') ||
            (item.id === 'quote' && currentView === 'quote');
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all",
                isActive
                  ? "bg-[#245F73] text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={15} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Divider + util section */}
      <div className="px-5 pt-6 pb-2 mt-2">
        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Tools</span>
      </div>
      <nav className="px-3 space-y-0.5">
        {utilItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            <item.icon size={15} strokeWidth={2} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto px-5 py-5 border-t border-white/5">
        <p className="text-[10px] text-white/20 font-medium tracking-wider uppercase">Total Quality Lending</p>
        <p className="text-[10px] text-white/10 mt-0.5">AI Deal Desk · v2</p>
      </div>
    </div>
  );
}
