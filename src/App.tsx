/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChatArea } from './components/ChatArea';
import { ChatAreaHandle } from './types';
import { OnboardingGuide } from './components/OnboardingGuide';
import { QuoteBuilder } from './components/QuoteBuilder';
import { Sidebar } from './components/Sidebar';
import { cn } from './lib/utils';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'chat' | 'quote'>('chat');
  const chatAreaRef = useRef<ChatAreaHandle>(null);

  const handleAction = (action: string) => {
    if (action === 'chat') {
      setCurrentView('chat');
    } else if (action === 'quote') {
      setCurrentView('quote');
    } else {
      chatAreaRef.current?.handleAction(action);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden font-sans">
      <main className="flex-1 h-full relative overflow-hidden flex flex-col">
        {currentView === 'chat' ? (
          <ChatArea 
            ref={chatAreaRef}
            onMenuClick={() => setIsSidebarOpen(true)} 
          />
        ) : (
          <QuoteBuilder onClose={() => setCurrentView('chat')} />
        )}
      </main>

      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 md:hidden animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Positioned fixed/drawer on mobile, relative/static on desktop */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-[80vw] max-w-[320px] bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:w-64 pt-[env(safe-area-inset-top)]",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
          currentView={currentView} 
          onOpenOnboarding={() => setShowOnboarding(true)}
          onAction={handleAction}
        />
      </div>
    </div>
  );
}
