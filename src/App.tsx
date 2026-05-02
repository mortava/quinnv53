/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChatArea, ChatAreaHandle } from './components/ChatArea';
import { OnboardingGuide } from './components/OnboardingGuide';
import { QuoteBuilder } from './components/QuoteBuilder';
import { Sidebar } from './components/Sidebar';

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
            onMenuClick={() => {}} 
          />
        ) : (
          <QuoteBuilder onClose={() => setCurrentView('chat')} />
        )}
      </main>
      
      {showOnboarding && (
        <OnboardingGuide onClose={() => setShowOnboarding(false)} />
      )}
    </div>
  );
}
