import React, { useState, useEffect } from 'react';

const quotes = [
  "\"Success is not final, failure is not fatal\"",
  "\"Commit your work, and your plans will be established\"",
  "\"Faith is taking the first step\"",
  "\"Work heartily, as for the Lord\"",
  "\"To be successful, have your heart in your business\""
];

export function TypewriterQuotes() {
  const [text, setText] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentQuote = quotes[quoteIndex];
    let timeout: NodeJS.Timeout;

    if (isDeleting) {
      if (text === '') {
        setIsDeleting(false);
        setQuoteIndex((prev) => (prev + 1) % quotes.length);
      } else {
        timeout = setTimeout(() => {
          setText(text.slice(0, -1));
        }, 15); // Faster delete
      }
    } else {
      if (text === currentQuote) {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 12000); // Wait 12 seconds before deleting
      } else {
        timeout = setTimeout(() => {
          setText(currentQuote.slice(0, text.length + 1));
        }, 60); // Slower typing speed
      }
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, quoteIndex]);

  return (
    <div className="w-full max-w-2xl py-6 px-4 text-center mt-4">
      <p className="font-serif italic text-slate-400 text-sm md:text-base leading-relaxed tracking-wide min-h-[3rem]">
        {text}
        <span className="inline-block w-0.5 h-4 bg-navy-400 ml-1 animate-pulse align-middle"></span>
      </p>
    </div>
  );
}
