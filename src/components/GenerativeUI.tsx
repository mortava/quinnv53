import React, { useState, useRef } from 'react';
import { GenerativeUIData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Mail, TrendingUp, Trophy, User, DollarSign, Briefcase, Paperclip, Send, Plus, X, Check, Save, Lightbulb, MapPin, Home, School, Coffee, Info, FileText, Share2, ShieldCheck, Zap, CheckCircle2, AlertCircle, ChevronRight, Calculator, ExternalLink, ArrowRight, Bookmark } from 'lucide-react';
import { cn } from '../lib/utils';
import { SourceRef } from '../types';

interface GenerativeUIProps {
  ui: GenerativeUIData;
  onOpenPricing?: () => void;
  onOpenSource?: (source: SourceRef) => void;
}

const COLORS = ['#0A2540', '#3B82F6', '#10B981', '#F59E0B', '#6366F1'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{data.name}</p>
        <p className="text-lg font-bold text-navy-900">
          {typeof data.value === 'number' && data.value <= 100 && data.name.toLowerCase().includes('ltv') 
            ? `${data.value}%` 
            : data.value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const SourceChip = ({ source, onClick }: { source: SourceRef; onClick?: () => void }) => (
  <button 
    onClick={(e) => {
      e.stopPropagation();
      onClick?.();
    }}
    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-navy-50 text-navy-700 rounded-full border border-navy-100 hover:bg-navy-100 transition-all group/source ml-2"
  >
    <Bookmark size={10} className="text-navy-400 group-hover/source:text-navy-600" />
    <span className="text-[10px] font-bold uppercase tracking-wider">{source.docId} § {source.sectionTitle}</span>
  </button>
);

export function GenerativeUI({ ui, onOpenPricing, onOpenSource }: GenerativeUIProps) {
  const handleOpenSource = () => {
    if (ui.sourceRef && onOpenSource) {
      onOpenSource(ui.sourceRef);
    }
  };

  switch (ui.type) {
    case 'chart':
      return <ChartUI data={ui.data} sourceRef={ui.sourceRef} onOpenSource={onOpenSource} />;
    case 'card':
      return <CardUI data={ui.data} sourceRef={ui.sourceRef} onOpenSource={onOpenSource} />;
    case 'deal':
      return <DealUI data={ui.data} sourceRef={ui.sourceRef} onOpenSource={onOpenSource} />;
    case 'email':
      return <EmailUI data={ui.data} sourceRef={ui.sourceRef} onOpenSource={onOpenSource} />;
    case 'leaderboard':
      return <LeaderboardUI data={ui.data} sourceRef={ui.sourceRef} onOpenSource={onOpenSource} />;
    case 'ideas':
      return <FreshIdeasUI data={ui.data} sourceRef={ui.sourceRef} onOpenSource={onOpenSource} />;
    case 'quoteBuilder':
      return <QuoteBuilderUI data={ui.data} sourceRef={ui.sourceRef} onOpenSource={onOpenSource} />;
    case 'image':
      return <ImageUI data={ui.data} />;
    case 'document':
      return <DocumentAnalysisUI data={ui.data} />;
    case 'pricing':
      return <PricingUI data={ui.data} onOpenPricing={onOpenPricing} />;
    default:
      return null;
  }
}

function PricingUI({ data, onOpenPricing }: { data: any; onOpenPricing?: () => void }) {
  return (
    <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 mt-6 w-full overflow-hidden font-sans animate-in zoom-in duration-700 text-left relative group">
      {/* Decorative Background Element */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-navy-50 rounded-full opacity-20 blur-3xl group-hover:bg-navy-100 transition-colors duration-700" />
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <div className="bg-navy-900 p-4 rounded-[1.25rem] text-white shadow-2xl shadow-navy-200 ring-8 ring-navy-50/50">
              <Calculator size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">TotalPricer Engine</h3>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex gap-0.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Real-time Rates Active</p>
              </div>
            </div>
          </div>
          
          <div className="hidden md:block text-right">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Version</p>
            <p className="text-xs font-bold text-slate-400">TQL.REL_2024.04</p>
          </div>
        </div>
        
        <div className="mb-10">
          <p className="text-slate-600 text-lg md:text-xl leading-relaxed font-medium max-w-2xl">
            {data?.message || "Our proprietary pricing engine allows you to run complex loan scenarios, compare secondary market executions, and lock rates instantly."}
          </p>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-3 gap-4">
          {[
            { label: 'Access', value: 'Instant & Direct', icon: Zap },
            { label: 'Calculations', value: 'Market-Ready', icon: ShieldCheck },
            { label: 'Status', value: 'Production', icon: CheckCircle2 }
          ].map((item, i) => (
            <div key={i} className="bg-slate-50/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 hover:border-navy-100 transition-colors group/item">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <item.icon size={10} className="text-navy-300" />
                {item.label}
              </p>
              <p className="text-xs font-bold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-8 border-t border-slate-100">
          <button 
            onClick={onOpenPricing}
            className="w-full py-5 px-10 bg-navy-900 hover:bg-navy-800 text-white rounded-2xl font-bold text-lg transition-all shadow-[0_20px_40px_-12px_rgba(10,37,64,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(10,37,64,0.4)] hover:-translate-y-1 flex items-center justify-center gap-3 group active:scale-[0.98] border border-white/10"
          >
            <span>Launch Pricing Interface</span>
            <ExternalLink size={20} strokeWidth={2.5} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
          </button>
          
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            <div className="flex items-center gap-2.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
              <div className="w-1.5 h-1.5 rounded-full bg-navy-100" />
              Secure Session
            </div>
            <div className="flex items-center gap-2.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
              <div className="w-1.5 h-1.5 rounded-full bg-navy-100" />
              Compliance Verified
            </div>
            <div className="flex items-center gap-2.5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
              <div className="w-1.5 h-1.5 rounded-full bg-navy-100" />
              Cloud Native
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentAnalysisUI({ data }: { data: any }) {
  const { fileName, summary, keyPoints, insights, documentType, confidenceScore = 98 } = data;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mt-4 w-full overflow-hidden font-sans">
      <div className="bg-navy-900 p-6 text-white flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
            <FileText size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold leading-tight">{documentType}</h3>
            <p className="text-xs text-white/60 font-medium mt-1 uppercase tracking-widest">{fileName}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span className="text-xl font-bold text-white">{confidenceScore}%</span>
          </div>
          <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">AI Confidence</p>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Summary Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} className="text-navy-600" />
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Executive Summary</h4>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            {summary}
          </p>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 gap-8">
          {/* Key Points */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Key Findings</h4>
            </div>
            <ul className="space-y-3">
              {keyPoints.map((point: string, i: number) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-200 mt-1.5 group-hover:bg-navy-400 transition-colors shrink-0" />
                  <span className="leading-tight">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Insights */}
          {insights && insights.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={16} className="text-amber-500" />
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Strategic Insights</h4>
              </div>
              <div className="space-y-3">
                {insights.map((insight: string, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                    {insight}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 p-4 bg-slate-50/50 flex justify-between items-center px-6">
        <div className="flex gap-4">
          <button className="flex items-center gap-1.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-navy-600 transition-colors group">
            Share Analysis <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div className="text-[10px] text-slate-400 font-medium italic">
          Processed by Quinn v4.2
        </div>
      </div>
    </div>
  );
}

function ImageUI({ data }: { data: any }) {
  const { url, title, prompt } = data;
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mt-4 w-full overflow-hidden font-sans group">
      <div className="relative aspect-square md:aspect-video overflow-hidden bg-slate-100">
        <img 
          src={url} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p className="text-white text-[10px] italic line-clamp-2 opacity-80">{prompt}</p>
        </div>
      </div>
      <div className="p-5 flex justify-between items-center bg-white border-t border-slate-100">
        <div className="text-left">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">AI Generated Visualization</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-slate-400 hover:text-navy-600 hover:bg-slate-50 rounded-lg transition-colors">
            <Share2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function QuoteBuilderUI({ data, sourceRef, onOpenSource }: { data: any; sourceRef?: SourceRef; onOpenSource?: (s: SourceRef) => void }) {
  const { clientName, propertyAddress, estimatedValue, loanAmount, interestRate, monthlyPayment, marketData } = data;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mt-4 w-full overflow-hidden font-sans text-left">
      {/* Header */}
      <div className="bg-navy-900 p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-navy-300 text-xs font-bold uppercase tracking-widest">Loan Quote</p>
              {sourceRef && <SourceChip source={sourceRef} onClick={() => onOpenSource?.(sourceRef)} />}
            </div>
            <h3 className="text-2xl font-bold">{clientName}</h3>
          </div>
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/10">
            <Home size={24} className="text-white" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-navy-100 text-sm">
          <MapPin size={16} className="text-navy-400" />
          <span className="truncate">{propertyAddress}</span>
        </div>
      </div>

      {/* Quote Details */}
      <div className="p-6">
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-6 mb-8">
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Estimated Value</p>
            <p className="text-xl font-bold text-slate-900">${estimatedValue?.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Loan Amount</p>
            <p className="text-xl font-bold text-slate-900">${loanAmount?.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Interest Rate</p>
            <p className="text-xl font-bold text-emerald-600">{interestRate}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Monthly Payment</p>
            <p className="text-xl font-bold text-navy-700">${monthlyPayment?.toLocaleString()}</p>
          </div>
        </div>

        {/* Real-Time Market Data (from Search/Maps) */}
        {marketData && (
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-navy-600" />
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Real-Time Market Insights</h4>
            </div>
            
            <div className="space-y-4">
              {marketData.areaAveragePrice && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600 font-medium">Area Average Price</span>
                  <span className="text-sm font-bold text-slate-900">${marketData.areaAveragePrice.toLocaleString()}</span>
                </div>
              )}
              
              {marketData.marketTrend && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600 font-medium">Market Trend</span>
                  <span className={cn(
                    "text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider",
                    marketData.marketTrend === 'Rising' ? "bg-emerald-100 text-emerald-700" :
                    marketData.marketTrend === 'Falling' ? "bg-red-100 text-red-700" :
                    "bg-blue-100 text-blue-700"
                  )}>
                    {marketData.marketTrend}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 pt-2">
                {marketData.nearbySchools && marketData.nearbySchools.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <School size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Top Schools</span>
                    </div>
                    <ul className="space-y-1">
                      {marketData.nearbySchools.slice(0, 2).map((school: string, i: number) => (
                        <li key={i} className="text-xs text-slate-700 font-medium truncate">• {school}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {marketData.localAmenities && marketData.localAmenities.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Coffee size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Amenities</span>
                    </div>
                    <ul className="space-y-1">
                      {marketData.localAmenities.slice(0, 2).map((amenity: string, i: number) => (
                        <li key={i} className="text-xs text-slate-700 font-medium truncate">• {amenity}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
          <button 
            onClick={() => sourceRef && onOpenSource?.(sourceRef)}
            className="flex items-center gap-1.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[#0A2540] hover:underline transition-colors group"
          >
            View Source Guideline <ChevronRight size={14} className="mt-0.5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="flex items-center gap-1.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 group cursor-not-allowed">
            View Full Quote <ArrowRight size={14} className="mt-0.5" />
          </button>
        </div>
        
        <p className="text-[10px] text-slate-400 text-center mt-6 flex items-center justify-center gap-1 italic">
          <Info size={10} /> Live market data via Google Maps Grounding
        </p>
      </div>
    </div>
  );
}

function FreshIdeasUI({ data, sourceRef, onOpenSource }: { data: any; sourceRef?: SourceRef; onOpenSource?: (s: SourceRef) => void }) {
  const { title, ideas } = data;
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-4 w-full text-left">
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-amber-100 p-2 rounded-lg">
            <Lightbulb size={20} className="text-amber-600" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{title}</h3>
        </div>
        {sourceRef && <SourceChip source={sourceRef} onClick={() => onOpenSource?.(sourceRef)} />}
      </div>
      
      <div className="space-y-4">
        {ideas.map((idea: any, index: number) => (
          <div key={index} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition-all group">
            <h4 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-amber-700 transition-colors">{idea.title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{idea.description}</p>
            {idea.tags && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {idea.tags.map((tag: string, i: number) => (
                  <span key={i} className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-500 font-bold uppercase tracking-wider">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartUI({ data, sourceRef, onOpenSource }: { data: any; sourceRef?: SourceRef; onOpenSource?: (s: SourceRef) => void }) {
  const { chartType, title, data: chartData } = data;
  const maxValue = Math.max(...chartData.map((d: any) => d.value));
  const isLTV = title.toLowerCase().includes('ltv');

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 mt-4 w-full overflow-hidden font-sans animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start mb-8 text-left">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{title}</h3>
            {sourceRef && <SourceChip source={sourceRef} onClick={() => onOpenSource?.(sourceRef)} />}
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Market Analysis Report</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Peak Value</p>
          <p className="text-xl font-bold text-navy-900">{isLTV ? `${maxValue}%` : maxValue.toLocaleString()}</p>
        </div>
      </div>

      <div className="w-full h-[250px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0A2540" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#0A2540" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                tickFormatter={(val) => isLTV ? `${val}%` : val}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#0A2540" 
                strokeWidth={4} 
                dot={{ r: 4, fill: '#0A2540', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 6, strokeWidth: 0 }} 
                animationDuration={1500}
              />
            </LineChart>
          ) : chartType === 'pie' ? (
            <PieChart>
              <Pie 
                data={chartData} 
                cx="50%" 
                cy="50%" 
                innerRadius={60} 
                outerRadius={80} 
                paddingAngle={8} 
                dataKey="value"
                animationDuration={1500}
              >
                {chartData.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
            </PieChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0A2540" stopOpacity={1} />
                  <stop offset="100%" stopColor="#1E3A8A" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                tickFormatter={(val) => isLTV ? `${val}%` : val}
              />
              <RechartsTooltip cursor={{ fill: '#f8fafc', radius: 8 }} content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill="url(#barGradient)" 
                radius={[6, 6, 0, 0]} 
                barSize={40}
                animationDuration={1500}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-6">
        <div className="flex gap-4">
          {chartData.slice(0, 3).map((d: any, i: number) => (
            <div key={i} className="flex items-center gap-1.5 text-left">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chartType === 'pie' ? COLORS[i % COLORS.length] : '#0A2540' }} />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-[60px]">{d.name}</span>
            </div>
          ))}
        </div>
        <button 
          onClick={() => sourceRef && onOpenSource?.(sourceRef)}
          className="text-[11px] font-bold text-navy-600 uppercase tracking-widest hover:underline flex items-center gap-1.5 transition-all w-fit group"
        >
          Learn More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

function CardUI({ data, sourceRef, onOpenSource }: { data: any; sourceRef?: SourceRef; onOpenSource?: (s: SourceRef) => void }) {
  const { title, description, metrics } = data;
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 mt-4 w-full overflow-hidden font-sans animate-in zoom-in duration-500 text-left">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-navy-50 p-2 rounded-lg">
            <Info size={18} className="text-navy-600" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{title}</h3>
        </div>
        {sourceRef && <SourceChip source={sourceRef} onClick={() => onOpenSource?.(sourceRef)} />}
      </div>
      <p className="text-xs text-slate-800 mb-8 font-medium leading-relaxed">{description}</p>
      
      {metrics && metrics.length > 0 && (
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
          {metrics.map((m: any, i: number) => (
            <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-navy-200 transition-all group">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest group-hover:text-navy-400 transition-colors">{m.label}</p>
              <p className="text-xl font-bold text-navy-900 mt-1">{m.value}</p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <button 
          onClick={() => sourceRef && onOpenSource?.(sourceRef)}
          className="text-[11px] font-bold text-navy-600 uppercase tracking-widest hover:underline flex items-center gap-1.5 w-fit transition-all text-left group"
        >
          Check Guideline Source <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

function DealUI({ data, sourceRef, onOpenSource }: { data: any; sourceRef?: SourceRef; onOpenSource?: (s: SourceRef) => void }) {
  const dealsList = data.deals ? data.deals : (data.clientName ? [data] : []);
  const [filter, setFilter] = useState<string>('All');
  const [savingDealIndex, setSavingDealIndex] = useState<number | null>(null);
  const [savedDeals, setSavedDeals] = useState<number[]>([]);

  const stages = ['All', 'Prospecting', 'Negotiation', 'Closed Won', 'Closed Lost'];

  const filteredDeals = filter === 'All' ? dealsList : dealsList.filter((d: any) => d.stage === filter);
  
  const totalValue = filteredDeals.reduce((sum: number, deal: any) => sum + (deal.value || 0), 0);

  if (dealsList.length === 0) return null;

  const handleSaveClick = (idx: number) => {
    setSavingDealIndex(idx);
  };

  const confirmSave = () => {
    if (savingDealIndex !== null) {
      setSavedDeals([...savedDeals, savingDealIndex]);
      setSavingDealIndex(null);
    }
  };

  const cancelSave = () => {
    setSavingDealIndex(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 mt-4 w-full overflow-hidden font-sans relative text-left">
      <div className="bg-navy-900 p-6 text-white flex justify-between items-center text-left">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">Pipeline Control</p>
            {sourceRef && <SourceChip source={sourceRef} onClick={() => onOpenSource?.(sourceRef)} />}
          </div>
          <h3 className="text-xl font-bold">Deal Management</h3>
        </div>
        <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
          <Briefcase size={20} className="text-white" />
        </div>
      </div>
      
      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-hide">
          {stages.map(stage => (
            <button
              key={stage}
              onClick={() => setFilter(stage)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                filter === stage 
                  ? "bg-navy-900 text-white border-navy-900 shadow-md" 
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
              )}
            >
              {stage}
            </button>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Pipeline Value</span>
          <span className="text-sm font-bold text-navy-900">${totalValue.toLocaleString()}</span>
        </div>
      </div>

      <div className="p-5 max-h-[400px] overflow-y-auto space-y-4">
        {filteredDeals.length > 0 ? filteredDeals.map((deal: any, idx: number) => (
          <div key={idx} className="border border-slate-200 rounded-xl p-4 hover:border-navy-200 transition-all bg-white group/deal">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-bold text-slate-900">{deal.clientName}</h4>
              <span className={cn(
                "text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest",
                deal.stage === 'Closed Won' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                deal.stage === 'Closed Lost' ? "bg-red-50 text-red-700 border-red-200" :
                deal.stage === 'Negotiation' ? "bg-amber-50 text-amber-700 border-amber-200" :
                "bg-blue-50 text-blue-700 border-blue-200"
              )}>
                {deal.stage}
              </span>
            </div>
            
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-6 mb-4">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><DollarSign size={10}/> Loan Amount</p>
                <p className="text-sm font-bold text-slate-900">${deal.value?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><TrendingUp size={10}/> Probability</p>
                <p className="text-sm font-bold text-emerald-600">{deal.probability !== undefined ? `${deal.probability}%` : 'N/A'}</p>
              </div>
            </div>
            
            <button 
              onClick={() => handleSaveClick(dealsList.indexOf(deal))}
              disabled={savedDeals.includes(dealsList.indexOf(deal))}
              className="w-full bg-navy-900 hover:bg-navy-800 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savedDeals.includes(dealsList.indexOf(deal)) ? "Sync Complete" : <>Sync to CRM <Save size={14} /></>}
            </button>
          </div>
        )) : (
          <div className="text-center py-10 text-slate-400 text-sm font-medium">
            No active opportunities in this stage.
          </div>
        )}
      </div>

      <div className="p-5 pt-0">
        <div className="pt-4 border-t border-slate-100">
           <button 
             onClick={() => sourceRef && onOpenSource?.(sourceRef)}
             className="text-[11px] font-bold text-navy-600 uppercase tracking-widest hover:underline flex items-center gap-1 transition-all"
           >
            View Guideline Source <ChevronRight size={14} className="mt-0.5" />
          </button>
        </div>
      </div>

      {/* Confirmation Overlay */}
      {savingDealIndex !== null && (
        <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-lg shadow-xl p-5 w-full max-w-sm border border-slate-100">
            <h4 className="text-lg font-bold text-slate-900 mb-2">Confirm Save</h4>
            <p className="text-sm text-slate-600 mb-5">
              Are you sure you want to save the deal for <strong>{dealsList[savingDealIndex]?.clientName}</strong> to your pipeline?
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={cancelSave} 
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmSave} 
                className="px-4 py-2 text-sm font-bold bg-[#0A2540] text-white hover:bg-[#0A2540]/90 rounded-md transition-colors flex items-center gap-2"
              >
                Confirm Save <Save size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmailUI({ data, sourceRef, onOpenSource }: { data: any; sourceRef?: SourceRef; onOpenSource?: (s: SourceRef) => void }) {
  const { subject, body, to } = data;
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSent, setIsSent] = useState(false);
  
  // Recipient management state
  const [recipients, setRecipients] = useState<string[]>(to ? [to] : []);
  const [newRecipient, setNewRecipient] = useState('');
  const [isAddingRecipient, setIsAddingRecipient] = useState(!to);

  // Attachment management state
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendClick = () => setShowConfirm(true);
  const handleConfirmSend = () => {
    setShowConfirm(false);
    setIsSent(true);
  };
  const handleCancel = () => setShowConfirm(false);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const addRecipient = () => {
    const email = newRecipient.trim();
    if (email) {
      setRecipients([...recipients, email]);
      setNewRecipient('');
      setIsAddingRecipient(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (newRecipient.trim()) {
        addRecipient();
      }
    }
  };

  const removeRecipient = (index: number) => {
    const newRecipients = [...recipients];
    newRecipients.splice(index, 1);
    setRecipients(newRecipients);
    if (newRecipients.length === 0) {
      setIsAddingRecipient(true);
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 mt-4 w-full overflow-hidden font-sans relative text-left">
      {/* TQL Brand Header */}
      <div className="bg-navy-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-white">
          <Mail size={18} className="text-[#CBA052]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/90">Enterprise Email Architect</span>
          {sourceRef && <SourceChip source={sourceRef} onClick={() => onOpenSource?.(sourceRef)} />}
        </div>
        <div className="flex gap-1.5 opacity-40">
          <div className="w-2 h-2 rounded-full bg-white"></div>
          <div className="w-2 h-2 rounded-full bg-white"></div>
          <div className="w-2 h-2 rounded-full bg-white"></div>
        </div>
      </div>
      
      <div className="p-0">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center text-sm flex-wrap gap-2 bg-slate-50/30">
          <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider w-12">To</span>
          {recipients.map((r, i) => {
            const valid = isValidEmail(r);
            return (
              <span key={i} className={cn(
                "font-bold px-3 py-1 rounded-full text-xs flex items-center gap-2 border transition-all",
                valid ? "bg-white text-navy-900 border-slate-200" : "bg-red-50 text-red-700 border-red-200"
              )}>
                {r}
                <button onClick={() => removeRecipient(i)} className={cn(
                  "transition-colors",
                  valid ? "text-slate-400 hover:text-slate-900" : "text-red-400 hover:text-red-600"
                )}>
                  <X size={12}/>
                </button>
              </span>
            );
          })}
          {isAddingRecipient ? (
            <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 transition-all">
              <input
                type="email"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter email..."
                className="text-xs px-3 py-1 border border-slate-200 rounded-full outline-none focus:border-navy-500 w-48 shadow-sm transition-all"
                autoFocus
              />
              <button onClick={addRecipient} className="text-navy-600 hover:bg-navy-50 p-1.5 rounded-full transition-colors">
                <Check size={14}/>
              </button>
              <button onClick={() => { setIsAddingRecipient(false); setNewRecipient(''); }} className="text-slate-400 hover:bg-slate-50 p-1.5 rounded-full transition-colors">
                <X size={14}/>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAddingRecipient(true)} 
              className="text-[10px] font-bold text-navy-600 bg-white hover:bg-navy-50 px-3 py-1 rounded-full flex items-center gap-1.5 transition-all border border-slate-200 shadow-sm"
            >
              <Plus size={12} /> ADD
            </button>
          )}
        </div>
        
        <div className="px-6 py-4 border-b border-slate-100 flex items-center text-sm">
          <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider w-12">Subject</span>
          <span className="text-slate-900 font-bold">{subject}</span>
        </div>
        
        <div className="p-6 md:p-8 text-[15px] text-slate-700 whitespace-pre-wrap min-h-[160px] leading-[1.6] font-medium">
          {body}
        </div>
        
        {attachments.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex flex-wrap gap-2.5">
            {attachments.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-[11px] font-bold text-slate-700 shadow-sm group">
                <Paperclip size={12} className="text-slate-400 group-hover:text-navy-500 transition-colors" />
                <span className="truncate max-w-[180px]">{file.name}</span>
                <button onClick={() => removeAttachment(idx)} className="text-slate-300 hover:text-red-500 transition-colors">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
        <input 
          type="file" 
          multiple 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
        />
        <button 
          onClick={handleAttachmentClick}
          className="flex items-center gap-2 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-navy-900 bg-white border border-slate-200 rounded-xl transition-all shadow-sm hover:shadow-md"
        >
          <Paperclip size={14} />
          <span>Attach Files</span>
        </button>
        <div className="flex gap-3">
          <button className="px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors">Discard</button>
          <button 
            onClick={handleSendClick}
            disabled={isSent || recipients.length === 0}
            className="px-6 py-2 text-[11px] font-bold uppercase tracking-[0.1em] bg-navy-900 text-white hover:bg-navy-800 rounded-xl transition-all shadow-lg hover:shadow-navy-200 flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {isSent ? "Email Dispatched" : <>Deploy Draft <Send size={14} /></>}
          </button>
        </div>
      </div>

      {/* Confirmation Overlay */}
      {showConfirm && (
        <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-lg shadow-xl p-5 w-full max-w-sm border border-slate-100">
            <h4 className="text-lg font-bold text-slate-900 mb-2">Confirm Send</h4>
            <p className="text-sm text-slate-600 mb-5">
              Are you sure you want to send this email to {recipients.join(', ')}?
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={handleCancel} 
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmSend} 
                className="px-4 py-2 text-sm font-bold bg-[#0A2540] text-white hover:bg-[#0A2540]/90 rounded-md transition-colors flex items-center gap-2"
              >
                Confirm Send <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LeaderboardUI({ data, sourceRef, onOpenSource }: { data: any; sourceRef?: SourceRef; onOpenSource?: (s: SourceRef) => void }) {
  const { title, entries } = data;
  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 mt-4 w-full overflow-hidden font-sans animate-in slide-in-from-right-4 duration-500 text-left">
      <div className="flex items-center justify-between mb-8 text-left">
        <div className="flex items-center gap-3 text-left">
          <div className="bg-amber-100 p-2 rounded-lg">
            <Trophy size={20} className="text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{title}</h3>
              {sourceRef && <SourceChip source={sourceRef} onClick={() => onOpenSource?.(sourceRef)} />}
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Top Performers</p>
          </div>
        </div>
        <div className="bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Q1 2026</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {entries.sort((a: any, b: any) => a.rank - b.rank).map((entry: any, index: number) => (
          <div key={index} className={cn(
            "flex items-center justify-between p-4 rounded-xl transition-all border group",
            entry.rank === 1 ? "bg-amber-50/50 border-amber-100 hover:bg-amber-50" : "bg-white border-slate-100 hover:bg-slate-50"
          )}>
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm",
                entry.rank === 1 ? "bg-amber-400 text-white" :
                entry.rank === 2 ? "bg-slate-300 text-white" :
                entry.rank === 3 ? "bg-orange-300 text-white" :
                "bg-slate-100 text-slate-500"
              )}>
                {entry.rank}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-navy-100 text-navy-700 flex items-center justify-center border-2 border-white shadow-sm">
                  <User size={18} />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 block">{entry.name}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enterprise Partner</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-bold text-navy-900 block">{entry.score.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">+12% growth</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 pt-6 border-t border-slate-100">
        <button 
          onClick={() => sourceRef && onOpenSource?.(sourceRef)}
          className="text-[11px] font-bold text-navy-600 uppercase tracking-widest hover:underline flex items-center gap-1.5 w-fit transition-all text-left group"
        >
          View Source Analysis <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform shadow-sm" />
        </button>
      </div>
    </div>
  );
}
