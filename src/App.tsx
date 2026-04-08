/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChatArea, ChatAreaHandle } from './components/ChatArea';
import { OnboardingGuide } from './components/OnboardingGuide';
import { QuoteBuilder } from './components/QuoteBuilder';

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
  const [currentView, setCurrentView] = useState<'chat' | 'quote'>('chat');
  const chatAreaRef = useRef<ChatAreaHandle>(null);

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden font-sans">
      <main className="flex-1 h-full relative overflow-hidden">
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
