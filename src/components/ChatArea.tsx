import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef, useCallback, lazy, Suspense } from 'react';
import { ArrowUp, Paperclip, Menu, Search, Briefcase, FileText, Copy, Share2, Check, ChevronDown, ChevronRight, X, ChevronUp, Mail, Trophy, Lightbulb, Home, RefreshCw, Trash2, Plus, Calculator } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, ChatAreaProps, ChatAreaHandle, SourceRef } from '../types';
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
            setMessages(prev => prev.map(msg => 
              msg.id === modelMessageId 
                ? { ...msg, generativeUI: chunk.generativeUI }
                : msg
            ));
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
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Header with Menu Trigger */}
      <div className="flex items-center p-4 border-b border-slate-100 bg-white">
        <button onClick={onMenuClick} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
          <Menu size={24} />
        </button>
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
            <div className="relative mb-6">
              <h1 className="text-[80px] leading-[89px] font-serif font-medium text-[#3CCFA8] tracking-tight">Quinn</h1>
            </div>
            <h1 className="text-[20px] font-sans leading-[22px] font-medium text-slate-500 mb-8 tracking-tight text-center">Let's make something special happen today.</h1>
            
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
              <div className="relative bg-white border border-slate-200 rounded-[2rem] shadow-sm focus-within:ring-2 focus-within:ring-navy-500/10 focus-within:border-navy-200 transition-all min-h-[120px] flex flex-col">
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
                    className="h-10 w-10 flex-shrink-0 bg-[#9cb2bc] hover:bg-[#8ba3ad] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all shadow-sm active:scale-95"
                  >
                    <ArrowUp size={20} strokeWidth={3} className="rotate-90" />
                  </button>
                </div>
              </div>
              <div className="flex justify-center mt-4 gap-4">
              </div>
            </div>

            <div className="text-center mt-4">
              <span className="text-[10px] text-slate-400 font-medium">Powered by Total Intelligence</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-12 w-full animate-in fade-in duration-500">
            {messages.map((msg, index) => (
              <div 
                key={msg.id} 
                className={cn(
                  "flex w-full gap-4 max-w-full",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === 'model' ? (
                  <div className="hidden md:flex flex-col items-center shrink-0 mt-2">
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                  </div>
                ) : null}
                
                <div className={cn(
                  "flex flex-col gap-2 relative transition-all",
                  msg.role === 'user' ? "max-w-xl" : "w-full flex-1 min-w-0"
                )}>
                  <div 
                    id={`message-content-${msg.id}`}
                    className={cn(
                      "px-0 py-0 w-full",
                      msg.role === 'user' 
                        ? "text-slate-900 text-right font-medium" 
                        : msg.isError
                          ? "bg-red-50 text-red-800 border border-red-100 rounded-2xl p-4"
                          : "text-slate-800"
                    )}
                  >
                    {msg.content && (
                      <div 
                        className={cn(
                          "text-[16px] leading-relaxed font-sans break-words whitespace-pre-wrap",
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
                      <div className="mt-6 w-full">
                        <GenerativeUI 
                          ui={msg.generativeUI} 
                          onOpenPricing={() => setIsPricingOpen(true)} 
                          onOpenSource={(source) => setActiveSource(source)}
                        />
                      </div>
                    )}
                  </div>
                  
                  {msg.role === 'model' && !msg.isError && !(isLoading && index === messages.length - 1) && (
                    <div className="flex items-center gap-4 mt-2">
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="text-slate-400 hover:text-navy-600 p-2 rounded-md hover:bg-slate-100 transition-colors"
                        title="Copy response"
                      >
                        {copiedId === msg.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                      </button>
                      <button
                        onClick={() => handleShare(msg.content, msg.id)}
                        className="text-slate-400 hover:text-navy-600 p-2 rounded-md hover:bg-slate-100 transition-colors"
                        title="Share response"
                      >
                        <Share2 size={16} />
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
                className="absolute bottom-24 right-6 p-2.5 bg-white shadow-xl rounded-full border border-slate-200 text-slate-500 hover:text-navy-600 hover:bg-slate-50 transition-all z-10 animate-in fade-in zoom-in"
              >
                <ChevronDown size={20} />
              </button>
            )}

            {/* Label */}
            <div className="px-5 flex items-center">
              <span className="text-[13px] font-bold text-slate-800 tracking-tight">Quinn | Deal Desk</span>
            </div>

            {/* Input Bubble */}
            <div className="relative bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 p-2 transition-all focus-within:shadow-[0_4px_20px_rgb(0,0,0,0.06)] focus-within:border-slate-300 transform-gpu">
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
                      className="p-3 text-slate-400 hover:text-navy-600 hover:bg-slate-50 rounded-full transition-all"
                    >
                      <Plus size={20} strokeWidth={2.5} />
                    </button>
                    <button 
                      onClick={resetChat}
                      className="p-3 text-slate-400 hover:text-navy-600 hover:bg-slate-50 rounded-full transition-all"
                    >
                      <RefreshCw size={18} strokeWidth={2.5} />
                    </button>
                    <button 
                      onClick={() => setIsPricingOpen(true)}
                      className="p-3 text-slate-400 hover:text-navy-600 hover:bg-slate-50 rounded-full transition-all"
                    >
                      <Calculator size={18} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Right Controls - Send */}
                  <button
                    onClick={() => handleSend()}
                    disabled={(!input.trim() && !selectedFile) || isLoading}
                    className={cn(
                      "w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-95",
                      (input.trim() || selectedFile) 
                        ? "bg-slate-50 text-slate-400 hover:bg-navy-900 hover:text-white" 
                        : "bg-slate-50 text-slate-200 cursor-not-allowed"
                    )}
                  >
                    <ArrowUp size={20} className={cn(isLoading && "animate-bounce")} />
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
