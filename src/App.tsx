import React from 'react';
import QuinnPaperApp from './components/QuinnPaperApp';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function App() {
  return <QuinnPaperApp />;
}
