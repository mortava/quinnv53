import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { ArrowUp, Mic, Paperclip, Menu, Search, Briefcase, FileText, Copy, Share2, Check, ChevronDown, ChevronRight, X, ChevronUp, Mail, Trophy, Lightbulb, Home, RefreshCw, Trash2 } from 'lucide-react';
import { Message } from '../types';
import { generateResponse } from '../services/gemini';
import { GenerativeUI } from './GenerativeUI';
import { TypewriterQuotes } from './TypewriterQuotes';
import { cn } from '../lib/utils';
import { v4 as uuidv4 } from 'uuid';

interface ChatAreaProps {
  onMenuClick: () => void;
}

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface ChatAreaHandle {
  handleAction: (action: string) => void;
}

function ThinkingAnimation() {
  const [phase, setPhase] = useState(0);
  const phases = [
    "Analyzing enterprise data...",
    "Accessing knowledge base...",
    "Synthesizing market insights...",
    "Optimizing results...",
    "Finalizing report..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((p) => (p < phases.length - 1 ? p + 1 : p));
    }, 1500);
    return () => clearInterval(interval);
  }, [phases.length]);

  return (
    <div className="flex flex-col gap-2 max-w-sm">
      <div className="flex items-center gap-3">
        <span className="text-[15px] text-slate-500 animate-pulse">{phases[phase]}</span>
      </div>
    </div>
  );
}

export const ChatArea = forwardRef<ChatAreaHandle, ChatAreaProps>(({ onMenuClick }, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isStaging, setIsStaging] = useState(false);
  const [stagingProgress, setStagingProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPriorChat, setShowPriorChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLTextAreaElement>(null);
  const activeInputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const resetChat = () => {
    setMessages([]);
    setInput('');
    setSelectedFile(null);
  };

  useEffect(() => {
    const adjustHeight = (ref: React.RefObject<HTMLTextAreaElement>) => {
      if (ref.current) {
        ref.current.style.height = 'auto';
        ref.current.style.height = `${Math.min(ref.current.scrollHeight, 160)}px`;
      }
    };
    if (messages.length === 0) {
      adjustHeight(heroInputRef);
    } else {
      adjustHeight(activeInputRef);
    }
  }, [input, messages.length]);

  useImperativeHandle(ref, () => ({
    handleAction: (action: string) => {
      if (action === 'reset') {
        resetChat();
        return;
      }
      let prompt = '';
      switch (action) {
        case 'image':
          prompt = "Generate a high-quality, professional visualization of a modern luxury residential property in a suburban setting.";
          break;
        case 'quote':
          prompt = "Build a dynamic loan quote for a property at 123 Main St, Los Angeles, CA.";
          break;
        case 'deal':
          prompt = "Help me create a new deal pipeline.";
          break;
        case 'email':
          prompt = "Help me build a professional email draft.";
          break;
        case 'leaderboard':
          prompt = "Show me the current sales leaderboard.";
          break;
        case 'ideas':
          prompt = "Give me some fresh ideas for sales outreach.";
          break;
        case 'chat':
          // Reset or show history logic could go here
          return;
      }
      if (prompt) {
        handleSend(prompt);
      }
    }
  }));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if ((!textToSend.trim() && !selectedFile) || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: textToSend || (selectedFile ? `Uploaded document: ${selectedFile.name}` : ''),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    if (!overrideInput) setInput('');
    setIsLoading(true);

    let fileData = undefined;
    if (selectedFile) {
      setIsUploading(true);
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(selectedFile);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
        
        // Extract base64 data and mime type
        const match = base64.match(/^data:(.+);base64,(.*)$/);
        if (match) {
          fileData = {
            mimeType: match[1],
            data: match[2],
          };
        }
        // Small artificial delay to show "uploading" state for better UX
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (error) {
        console.error("Error reading file:", error);
      } finally {
        setIsUploading(false);
      }
      setSelectedFile(null);
    }

    try {
      const response = await generateResponse([...messages, userMessage], fileData);
      
      const modelMessage: Message = {
        id: uuidv4(),
        role: 'model',
        content: response.text,
        timestamp: new Date(),
        generativeUI: response.generativeUI,
        isError: response.text.includes("I encountered an error") || response.text.includes("I'm having trouble connecting"),
      };

      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages(prev => [...prev, {
        id: uuidv4(),
        role: 'model',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date(),
        isError: true,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } else {
      alert("Speech recognition is not supported in this browser.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsStaging(true);
      setStagingProgress(0);
      
      // Simulate staging progress for visual feedback
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setStagingProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setSelectedFile(file);
          setIsStaging(false);
        }
      }, 50);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      const element = document.getElementById(`message-content-${id}`);
      const plainText = element ? element.innerText : text;
      
      if (element && window.ClipboardItem) {
        const html = element.innerHTML;
        const blobHtml = new Blob([html], { type: 'text/html' });
        const blobText = new Blob([plainText || ' '], { type: 'text/plain' });
        
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': blobHtml,
            'text/plain': blobText
          })
        ]);
      } else {
        await navigator.clipboard.writeText(plainText || ' ');
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      try {
        const fallbackText = document.getElementById(`message-content-${id}`)?.innerText || text;
        await navigator.clipboard.writeText(fallbackText || ' ');
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch (e) {}
    }
  };

  const handleShare = async (text: string, id: string) => {
    try {
      const element = document.getElementById(`message-content-${id}`);
      const plainText = element ? element.innerText : text;

      if (navigator.share) {
        await navigator.share({
          title: 'Quinn Response',
          text: plainText,
        });
      } else {
        await handleCopy(text, id);
        alert('Response copied to clipboard for sharing!');
      }
    } catch (err) {
      console.error('Failed to share: ', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full relative bg-white">
      {/* Header - Only visible when chat has started */}
      {messages.length > 0 && (
        <header className={cn(
          "flex items-center justify-between px-4 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-10 transition-all duration-300 h-12 md:h-14"
        )}>
          <div className="flex items-center">
            <div className="flex flex-col">
              <div className="relative">
                <span className="font-serif font-medium text-xs text-slate-400 tracking-tight leading-tight">Quınn</span>
                <div className="absolute top-[15%] left-[58%] w-0.5 h-0.5 bg-sky-500 rounded-full shadow-[0_0_4px_rgba(14,165,233,0.8)] animate-pulse" />
              </div>
              <span className="font-sans font-bold text-sm text-navy-900 tracking-tight leading-tight">Actions HUB</span>
            </div>
          </div>
        </header>
      )}

      {/* Messages / Hero Area */}
      <div className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden flex flex-col w-full max-w-full",
        messages.length === 0 ? "justify-center items-center p-6" : "p-3 md:p-4 space-y-6"
      )}>
        {messages.length === 0 ? (
          <div className="max-w-3xl w-full flex flex-col items-center justify-center h-full px-4 animate-in fade-in duration-700">
            {/* Logo/Title */}
            <div className="relative mb-6">
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif font-medium text-navy-900 tracking-tight">Quınn</h1>
              <div className="absolute top-[18%] left-[58.8%] w-1.5 h-1.5 bg-sky-500 rounded-full shadow-[0_0_10px_rgba(14,165,233,0.9)] animate-pulse" />
            </div>
            <h1 className="text-xl md:text-2xl font-medium text-slate-500 mb-10 tracking-tight text-center">Let's make something special happen today.</h1>
            
            {/* Centered Input Area */}
            <div className="w-full mb-6">
              {selectedFile && (
                <div className="mb-3 flex items-center gap-2 bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-[13px] w-max border border-slate-200 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-navy-100 p-1.5 rounded-lg text-navy-600">
                    <FileText size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="truncate max-w-[200px] font-bold text-slate-900">{selectedFile.name}</span>
                    <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Check size={10} strokeWidth={3} /> Ready for analysis
                    </span>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="ml-2 text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-slate-100">
                    <X size={16} />
                  </button>
                </div>
              )}
              {isStaging && (
                <div className="mb-3 flex flex-col gap-2 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 w-full max-w-xs animate-in fade-in">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Preparing document...</span>
                    <span className="text-[10px] font-mono text-slate-400">{stagingProgress}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-navy-600 transition-all duration-300 ease-out" 
                      style={{ width: `${stagingProgress}%` }}
                    />
                  </div>
                </div>
              )}
              <div className="relative bg-white border border-slate-200 rounded-2xl md:rounded-3xl shadow-sm focus-within:ring-1 focus-within:ring-navy-500/20 focus-within:border-navy-300 transition-all">
                <textarea
                  ref={heroInputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message Quinn..."
                  className="w-full max-h-40 min-h-[56px] md:min-h-[64px] py-4 pl-4 md:pl-5 pr-[110px] md:pr-[120px] bg-transparent border-none focus:ring-0 resize-none text-base outline-none text-slate-800 placeholder:text-slate-400 font-sans overflow-hidden"
                  rows={1}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-0.5 md:gap-1">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,.txt,.csv"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 md:p-2 text-slate-400 hover:text-navy-600 hover:bg-slate-50 rounded-full transition-colors"
                    title="Upload document"
                  >
                    <Paperclip size={20} />
                  </button>
                  <button 
                    onClick={toggleRecording}
                    className={cn(
                      "p-2.5 md:p-2 rounded-full transition-colors",
                      isRecording 
                        ? "text-red-500 bg-red-50 animate-pulse" 
                        : "text-slate-400 hover:text-navy-600 hover:bg-slate-50"
                    )}
                    title="Voice input"
                  >
                    <Mic size={20} />
                  </button>
                  <button
                    onClick={() => handleSend()}
                    disabled={(!input.trim() && !selectedFile) || isLoading}
                    className="h-10 w-10 md:h-9 md:w-9 ml-1 flex-shrink-0 bg-navy-900 hover:bg-navy-800 disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all shadow-md active:scale-95"
                  >
                    <ArrowUp size={20} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
              <div className="flex justify-center mt-4">
                <button 
                  onClick={resetChat}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                >
                  <Trash2 size={16} />
                  <span>Reset Chat</span>
                </button>
              </div>
            </div>

            {/* Quote Area */}
            <TypewriterQuotes />
          </div>
        ) : (
          <div className="flex flex-col space-y-6 w-full max-w-full animate-in fade-in duration-500">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "flex w-full gap-3 max-w-full",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === 'model' ? (
                  <div className="flex flex-col items-center shrink-0 mt-2 ml-1">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full shadow-[0_0_4px_rgba(15,23,42,0.5)] animate-pulse" />
                  </div>
                ) : (
                  <div className="w-4 h-0.5 bg-sky-400 shrink-0 mt-3 mr-1" />
                )}
                
                <div className={cn(
                  "flex flex-col gap-1",
                  msg.role === 'user' ? "max-w-[85%] md:max-w-[75%]" : "max-w-[90%] md:max-w-[85%]"
                )}>
                  <div 
                    id={`message-content-${msg.id}`}
                    className={cn(
                      "px-4 py-3",
                      msg.role === 'user' 
                        ? "bg-transparent text-slate-900 rounded-none px-0" 
                        : msg.isError
                          ? "bg-red-50 text-red-800 border border-red-100 rounded-2xl rounded-tl-sm"
                          : "bg-transparent text-slate-800 rounded-none"
                    )}
                  >
                    {msg.content && (
                      <div 
                        className={cn(
                          "text-[15px] leading-relaxed font-sans break-words whitespace-pre-wrap",
                          msg.role === 'model' && !msg.isError && "markdown-body"
                        )}
                      >
                        {msg.role === 'model' ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        ) : (
                          msg.content
                        )}
                      </div>
                    )}
                    {msg.isError && (
                      <button
                        onClick={() => {
                          const lastUserMsg = messages.filter(m => m.role === 'user').pop();
                          if (lastUserMsg) {
                            handleSend(lastUserMsg.content);
                          }
                        }}
                        className="mt-3 text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors shadow-sm"
                      >
                        <RefreshCw size={12} />
                        Retry Request
                      </button>
                    )}
                    {msg.generativeUI && (
                      <div className="mt-3 max-w-full overflow-x-auto">
                        <GenerativeUI ui={msg.generativeUI} />
                      </div>
                    )}
                  </div>
                  
                  {msg.role === 'model' && (
                    <div className="flex items-center gap-2 mt-1 ml-2">
                      <button 
                        onClick={() => handleCopy(msg.content, msg.id)} 
                        className="text-slate-400 hover:text-navy-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                        title="Copy response"
                      >
                        {copiedId === msg.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      </button>
                      <button 
                        onClick={() => handleShare(msg.content, msg.id)} 
                        className="text-slate-400 hover:text-navy-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                        title="Share response"
                      >
                        <Share2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {isUploading && (
          <div className="flex w-full gap-3 max-w-full justify-start animate-in fade-in">
            <div className="flex flex-col items-center shrink-0 mt-2 ml-1">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full shadow-[0_0_4px_rgba(15,23,42,0.5)] animate-pulse" />
            </div>
            <div className="flex flex-col gap-1 max-w-[90%] md:max-w-[85%]">
              <div className="px-4 py-3 bg-transparent text-slate-800 rounded-none">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-navy-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[15px] text-slate-500">Uploading and analyzing document...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {isLoading && !isUploading && (
          <div className="flex w-full gap-3 max-w-full justify-start animate-in fade-in">
            <div className="flex flex-col items-center shrink-0 mt-2 ml-1">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full shadow-[0_0_4px_rgba(15,23,42,0.5)] animate-pulse" />
            </div>
            <div className="flex flex-col gap-1 max-w-[90%] md:max-w-[85%]">
              <div className="px-4 py-3 bg-transparent text-slate-800 rounded-none">
                <ThinkingAnimation />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Only visible when chat has started */}
      {messages.length > 0 && (
        <div className="p-3 md:p-4 bg-white sticky bottom-0 pb-[max(env(safe-area-inset-bottom),0.75rem)] md:pb-[max(env(safe-area-inset-bottom),1rem)]">
          <div className="max-w-3xl mx-auto">
            {selectedFile && (
              <div className="mb-3 flex items-center gap-2 bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-[13px] w-max border border-slate-200 animate-in slide-in-from-bottom-2 duration-300">
                <div className="bg-navy-100 p-1.5 rounded-lg text-navy-600">
                  <FileText size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="truncate max-w-[200px] font-bold text-slate-900">{selectedFile.name}</span>
                  <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Check size={10} strokeWidth={3} /> Ready for analysis
                  </span>
                </div>
                <button onClick={() => setSelectedFile(null)} className="ml-2 text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-slate-100">
                  <X size={16} />
                </button>
              </div>
            )}
            {isStaging && (
              <div className="mb-3 flex flex-col gap-2 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 w-full max-w-xs animate-in fade-in">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Preparing document...</span>
                  <span className="text-[10px] font-mono text-slate-400">{stagingProgress}%</span>
                </div>
                <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-navy-600 transition-all duration-300 ease-out" 
                    style={{ width: `${stagingProgress}%` }}
                  />
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 relative bg-[#F1F5F9] border border-slate-200 rounded-3xl p-1.5 md:p-2 shadow-sm focus-within:border-navy-300 focus-within:ring-2 focus-within:ring-navy-500/10 transition-all">
              <div className="relative flex-1 bg-white rounded-2xl overflow-hidden transition-all">
                <textarea
                  ref={activeInputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message Quinn..."
                  className="w-full max-h-32 min-h-[44px] py-2.5 px-5 bg-transparent border-none focus:ring-0 resize-none text-base outline-none placeholder:text-slate-400 overflow-hidden"
                  rows={1}
                />
              </div>
              <div className="flex items-center gap-0.5 md:gap-1 pr-1">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".pdf,.doc,.docx,.txt,.csv"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 md:p-2 text-slate-500 hover:text-navy-600 transition-colors rounded-full hover:bg-white/50"
                  title="Upload document"
                >
                  <Paperclip size={20} />
                </button>
                <button 
                  onClick={toggleRecording}
                  className={cn(
                    "p-2.5 md:p-2 transition-colors rounded-full hover:bg-white/50",
                    isRecording 
                      ? "text-red-500 animate-pulse bg-red-50" 
                      : "text-slate-500" 
                  )}
                  title="Voice input"
                >
                  <Mic size={20} />
                </button>
                <button
                  onClick={() => handleSend()}
                  disabled={(!input.trim() && !selectedFile) || isLoading}
                  className="h-10 w-10 md:h-9 md:w-9 ml-1 flex-shrink-0 bg-navy-900 hover:bg-navy-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all shadow-md active:scale-95"
                >
                  <ArrowUp size={20} strokeWidth={2.5} />
                </button>
              </div>
            </div>
            <div className="text-center mt-3">
              <button 
                onClick={resetChat}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all mb-2"
              >
                <Trash2 size={14} />
                <span>Reset Chat</span>
              </button>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">Quinn can make mistakes. Consider verifying important information.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
