import React, { useState, useEffect } from 'react';

const phases = [
  "Analyzing guidelines...",
  "Verifying source of truth...",
  "Cross-referencing docs...",
  "Grounding response...",
  "Optimizing results..."
];

export function ThinkingAnimation() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((p) => (p < phases.length - 1 ? p + 1 : p));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-2 max-w-sm">
      <div className="flex items-center gap-3">
        <span className="text-[14px] text-slate-500 font-medium animate-pulse">{phases[phase]}</span>
      </div>
    </div>
  );
}
