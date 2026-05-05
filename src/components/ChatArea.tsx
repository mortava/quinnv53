import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef, useCallback, lazy, Suspense } from 'react';
import { ArrowUp, Paperclip, Menu, Search, Briefcase, FileText, Copy, Share2, Check, ChevronDown, ChevronRight, X, ChevronUp, Mail, Trophy, Lightbulb, Home, RefreshCw, Trash2, Plus, Calculator } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, ChatAreaProps, ChatAreaHandle, SourceRef, CitationSource } from '../types';
import { generateContentStream } from '../services/gemini';
import { GenerativeUI } from './GenerativeUI';
import { ThinkingAnimation } from './ThinkingAnimation';
const PricingModal = lazy(() => import('./PricingModal'));
const GuidelineSourcePanel = lazy(() => import('./GuidelineSourcePanel'));
import { cn } from '../lib/utils';
import { v4 as uuidv4 } from 'uuid';

export const ChatArea = forwardRef<ChatAreaHandle, ChatAreaProps>(({ onMenuClick }, ref) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isStaging, setIsStaging] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [activeSource, setActiveSource] = useState<SourceRef | null>(null);
  const [stagingProgress, setStagingProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPriorChat, setShowPriorChat] = useState(false);
  
  // Refactor: Scroll management
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLTextAreaElement>(null);
  const activeInputRef = useRef<HTMLTextAreaElement>(null);

  const resetChat = () => {
    setMessages([]);
    setInput('');
    setSelectedFile(null);
    setIsAutoScrollEnabled(true);
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
      setIsAutoScrollEnabled(true);
      setShowScrollDown(false);
    }
  };

  // Scroll detection
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      if (isAtBottom) {
        setIsAutoScrollEnabled(true);
        setShowScrollDown(false);
      } else {
        setIsAutoScrollEnabled(false);
        setShowScrollDown(true);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll on content change
  useEffect(() => {
    if (isAutoScrollEnabled) {
      scrollToBottom('smooth');
    }
  }, [messages, isLoading, isAutoScrollEnabled]);

  useEffect(() => {
    const adjustHeight = (ref: React.RefObject<HTMLTextAreaElement>) => {
      if (ref.current) {
        ref.current.style.height = 'auto';
        ref.current.style.height = `${ref.current.scrollHeight}px`;
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
        case 'pricer':
        case 'deal':
          setIsPricingOpen(true);
          return;
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

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if ((!textToSend.trim() && !selectedFile) || isLoading) return;

    const userMessageId = uuidv4();
    const userMessage: Message = {
      id: userMessageId,
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
        
        const match = base64.match(/^data:(.+);base64,(.*)$/);
        if (match) {
          fileData = { mimeType: match[1], data: match[2] };
        }
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (error) {
        console.error("Error reading file:", error);
      } finally {
        setIsUploading(false);
      }
      setSelectedFile(null);
    }

    const modelMessageId = uuidv4();
    const modelMessage: Message = {
      id: modelMessageId,
      role: 'model',
      content: '',
      timestamp: new Date(),
      isError: false,
    };
    setMessages(prev => [...prev, modelMessage]);

    try {
      const stream = await generateContentStream([...messages, userMessage], fileData);
      
      for await (const chunk of stream) {
        if ('text' in chunk && chunk.text) {
          setMessages(prev => prev.map(msg => 
            msg.id === modelMessageId 
              ? { ...msg, content: msg.content + chunk.text }
              : msg
          ));
        }
        
        if ('generativeUI' in chunk && chunk.generativeUI) {
            const ui = chunk.generativeUI;
            setMessages(prev => prev.map(msg => {
              if (msg.id !== modelMessageId) return msg;
              const newSource: CitationSource | null = ui.sourceRef ? {
                document: ui.sourceRef.docId || '',
                section: ui.sourceRef.sectionTitle || '',
                content: ui.sourceRef.content,
                docId: ui.sourceRef.docId,
                sectionId: ui.sourceRef.sectionId,
              } : null;
              const existingSources = msg.sources || [];
              const sources = newSource && !existingSources.some(s => s.section === newSource.section)
                ? [...existingSources, newSource]
                : existingSources;
              return { ...msg, generativeUI: ui, sources };
            }));
        }
      }
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === modelMessageId 
          ? { ...msg, content: 'Sorry, I encountered an error processing your request.', isError: true }
          : msg
      ));
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
    <div className="flex-1 flex flex-col h-full bg-[#F5F5F0] overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between h-14 px-5 border-b border-black/5 bg-[#F5F5F0] shrink-0">
        {/* Hamburger — mobile only */}
        <button onClick={onMenuClick} className="md:hidden p-1.5 text-black/40 hover:text-black transition-colors rounded-md">
          <Menu size={20} />
        </button>
        {/* Breadcrumb */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-[12px] font-bold text-black/25 uppercase tracking-widest">Quinn</span>
          <span className="text-[12px] text-black/15">/</span>
          <span className="text-[12px] font-bold text-black/50 uppercase tracking-widest">Deal Desk</span>
        </div>
        {/* Status pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-black/5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#245F73] animate-pulse" />
          <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Active</span>
        </div>
      </div>
      
      {/* Messages / Hero Area */}
      <div 
        ref={messagesContainerRef}
        className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden w-full h-full flex flex-col message-container",
        messages.length === 0 ? "justify-center" : ""
      )}>
        <div className={cn(
          "w-full mx-auto message-container",
          messages.length === 0 
            ? "max-w-4xl px-4" 
            : "max-w-3xl px-4 sm:px-6 md:px-8 lg:px-12 py-8 md:py-12 space-y-12"
        )}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center animate-in fade-in duration-700">
            {/* Logo/Title */}
            <div className="relative mb-4">
              <p className="text-[11px] font-bold text-[#245F73] uppercase tracking-[0.3em] mb-3 text-center">Total Quality Lending</p>
              <h1 className="text-[64px] leading-[1] font-bold text-black tracking-tight text-center">Quinn</h1>
            </div>
            <h1 className="text-[15px] font-sans leading-[22px] font-medium text-black/40 mb-8 tracking-tight text-center">NonQM Deal Desk · Ask anything about guidelines, pricing, or structuring.</h1>
            
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
              <div className="relative bg-white border border-black/8 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#245F73]/20 focus-within:border-[#245F73]/30 transition-all min-h-[120px] flex flex-col">
                <textarea
                  ref={heroInputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about NonQM Loans..."
                  className="w-full flex-1 py-5 px-6 bg-transparent border-none focus:ring-0 resize-none text-[16px] leading-[28px] outline-none text-[#0b0b0b] placeholder:text-slate-400 font-dm overflow-hidden"
                  rows={1}
                />
                <div className="flex items-center justify-between px-3 pb-3">
                  <div className="flex items-center">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept=".pdf,.doc,.docx,.txt,.csv"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-slate-400 hover:text-navy-600 hover:bg-white/50 rounded-full transition-colors"
                      title="Upload document"
                    >
                      <Plus size={22} strokeWidth={2.5} />
                    </button>
                  </div>
                  <button
                    onClick={() => handleSend()}
                    disabled={(!input.trim() && !selectedFile) || isLoading}
                    className="h-10 w-10 flex-shrink-0 bg-[#245F73] hover:bg-[#1d4f60] disabled:bg-black/8 disabled:text-black/20 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-all shadow-sm active:scale-95"
                  >
                    <ArrowUp size={20} strokeWidth={3} className="rotate-90" />
                  </button>
                </div>
              </div>
              <div className="flex justify-center mt-4 gap-4">
              </div>
            </div>

            <div className="text-center mt-4">
              <span className="text-[10px] text-black/25 font-medium uppercase tracking-widest">Powered by Total Intelligence</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-10 w-full animate-in fade-in duration-500">
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={cn(
                  "flex w-full gap-4 max-w-full",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "flex flex-col gap-1.5 relative transition-all",
                  msg.role === 'user' ? "max-w-xl items-end" : "w-full flex-1 min-w-0"
                )}>
                  {/* Role label */}
                  {msg.role === 'model' && (
                    <span className="text-[10px] font-bold text-[#245F73] uppercase tracking-widest mb-0.5">Quinn</span>
                  )}
                  <div
                    id={`message-content-${msg.id}`}
                    className={cn(
                      "w-full",
                      msg.role === 'user'
                        ? "bg-white border border-black/8 rounded-xl px-4 py-3 text-[14px] font-medium text-black/80 text-right shadow-sm"
                        : msg.isError
                          ? "bg-red-50 text-red-800 border border-red-100 rounded-xl p-4"
                          : "text-black/80"
                    )}
                  >
                    {msg.content && msg.generativeUI?.type !== 'answer' && (
                      <div
                        className={cn(
                          "text-[15px] leading-relaxed font-sans break-words whitespace-pre-wrap",
                          msg.role === 'model' && !msg.isError && "markdown-body"
                        )}
                      >
                        {msg.role === 'model' ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content.includes('"render') && msg.content.trim().startsWith('{') ? "I've generated a card for you (UI might be loading...)" : msg.content}
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
                        className="mt-4 text-xs font-bold flex items-center gap-1.5 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors shadow-sm mx-auto"
                      >
                        <RefreshCw size={14} />
                        Retry Request
                      </button>
                    )}
                    {msg.generativeUI && (
                      <div className={cn("w-full", msg.generativeUI.type !== 'answer' && "mt-6")}>
                        <GenerativeUI
                          ui={msg.generativeUI}
                          onOpenPricing={() => setIsPricingOpen(true)}
                          onOpenSource={(source) => setActiveSource(source)}
                        />
                      </div>
                    )}
                  </div>
                  
                  {msg.role === 'model' && !msg.isError && !(isLoading && index === messages.length - 1) && (
                    <div className="flex flex-col gap-2 mt-2">
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {msg.sources.map((source, i) => (
                            <button
                              key={i}
                              onClick={() => source.docId && setActiveSource({
                                docId: source.docId,
                                sectionId: source.sectionId || '',
                                sectionTitle: source.section,
                                content: source.content,
                              })}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-black/8 text-black/40 text-[10px] font-bold uppercase tracking-wide rounded-md hover:bg-[#245F73]/5 hover:border-[#245F73]/20 hover:text-[#245F73] transition-colors cursor-pointer"
                            >
                              <FileText size={10} />
                              {source.section}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="text-black/25 hover:text-black/60 p-1.5 rounded-md hover:bg-black/5 transition-colors"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? <Check size={14} className="text-[#245F73]" /> : <Copy size={14} />}
                        </button>
                        <button
                          onClick={() => handleShare(msg.content, msg.id)}
                          className="text-black/25 hover:text-black/60 p-1.5 rounded-md hover:bg-black/5 transition-colors"
                          title="Share response"
                        >
                          <Share2 size={14} />
                        </button>
                      </div>
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
      </div>

      <Suspense fallback={null}>
        <PricingModal 
          isOpen={isPricingOpen} 
          onClose={() => setIsPricingOpen(false)} 
        />
      </Suspense>

      <Suspense fallback={null}>
        <GuidelineSourcePanel 
          source={activeSource} 
          onClose={() => setActiveSource(null)} 
        />
      </Suspense>

      {/* Input Area - Floating Bubble UI */}
      {messages.length > 0 && (
        <div className="px-4 chat-composer-container shrink-0 z-20">
          <div className="max-w-3xl mx-auto flex flex-col gap-2">
            {/* Scroll-to-bottom button */}
            {showScrollDown && (
              <button
                onClick={() => scrollToBottom()}
                className="absolute bottom-24 right-6 p-2.5 bg-white shadow-xl rounded-lg border border-black/8 text-black/40 hover:text-black/70 hover:bg-black/5 transition-all z-10 animate-in fade-in zoom-in"
              >
                <ChevronDown size={20} />
              </button>
            )}

            {/* Input Panel */}
            <div className="relative bg-white rounded-xl shadow-sm border border-black/8 p-2 transition-all focus-within:ring-2 focus-within:ring-[#245F73]/15 focus-within:border-[#245F73]/25 transform-gpu">
              {/* File Staging / Progress UI */}
              {(selectedFile || isStaging) && (
                <div className="px-4 pt-2 pb-1">
                  {selectedFile && (
                    <div className="flex items-center gap-2 bg-slate-50 text-slate-700 px-3 py-1.5 rounded-full text-[12px] w-max border border-slate-100 mb-1 animate-in slide-in-from-top-1">
                      <div className="text-navy-600"><FileText size={14} /></div>
                      <span className="truncate max-w-[150px] font-semibold">{selectedFile.name}</span>
                      <button onClick={() => setSelectedFile(null)} className="ml-1 text-slate-400 hover:text-red-500"><X size={14} /></button>
                    </div>
                  )}
                  {isStaging && (
                    <div className="w-full flex items-center gap-2 animate-pulse mb-1">
                      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-navy-600 transition-all" style={{ width: `${stagingProgress}%` }} />
                      </div>
                      <span className="text-[9px] font-bold text-slate-400">{stagingProgress}%</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col">
                <textarea
                  ref={activeInputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about NonQM Loans..."
                  rows={1}
                  className="w-full bg-transparent border-none focus:ring-0 text-[15px] font-medium text-slate-700 placeholder:text-slate-400 py-3 px-4 resize-none max-h-48 scrollbar-hide"
                  disabled={isLoading}
                />

                <div className="flex items-center justify-between pl-2 pr-1 pb-1">
                  {/* Left Controls */}
                  <div className="flex items-center gap-0.5">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept=".pdf,.doc,.docx,.txt,.csv"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 text-black/30 hover:text-black/70 hover:bg-black/5 rounded-lg transition-all"
                    >
                      <Plus size={18} strokeWidth={2} />
                    </button>
                    <button
                      onClick={resetChat}
                      className="p-2.5 text-black/30 hover:text-black/70 hover:bg-black/5 rounded-lg transition-all"
                    >
                      <RefreshCw size={16} strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => setIsPricingOpen(true)}
                      className="p-2.5 text-black/30 hover:text-black/70 hover:bg-black/5 rounded-lg transition-all"
                    >
                      <Calculator size={16} strokeWidth={2} />
                    </button>
                  </div>

                  {/* Right Controls - Send */}
                  <button
                    onClick={() => handleSend()}
                    disabled={(!input.trim() && !selectedFile) || isLoading}
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-all shadow-sm active:scale-95",
                      (input.trim() || selectedFile)
                        ? "bg-[#245F73] text-white hover:bg-[#1d4f60]"
                        : "bg-black/5 text-black/20 cursor-not-allowed"
                    )}
                  >
                    <ArrowUp size={18} className={cn(isLoading && "animate-bounce")} />
                  </button>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex justify-between items-center px-5">
              <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Powered by Total Intelligence</span>
              <p className="text-[10px] text-slate-400 font-medium italic opacity-70">
                Quinn can make mistakes. Consider verifying important information.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
