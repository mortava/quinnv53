import React, { useState, useRef } from 'react';
import { GenerativeUIData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Mail, TrendingUp, Trophy, User, DollarSign, Briefcase, Paperclip, Send, Plus, X, Check, Save, Lightbulb, MapPin, Home, School, Coffee, Info, FileText, Share2, ShieldCheck, Zap, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface GenerativeUIProps {
  ui: GenerativeUIData;
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

export function GenerativeUI({ ui }: GenerativeUIProps) {
  switch (ui.type) {
    case 'chart':
      return <ChartUI data={ui.data} />;
    case 'card':
      return <CardUI data={ui.data} />;
    case 'deal':
      return <DealUI data={ui.data} />;
    case 'email':
      return <EmailUI data={ui.data} />;
    case 'leaderboard':
      return <LeaderboardUI data={ui.data} />;
    case 'ideas':
      return <FreshIdeasUI data={ui.data} />;
    case 'quoteBuilder':
      return <QuoteBuilderUI data={ui.data} />;
    case 'image':
      return <ImageUI data={ui.data} />;
    case 'document':
      return <DocumentAnalysisUI data={ui.data} />;
    default:
      return null;
  }
}

function DocumentAnalysisUI({ data }: { data: any }) {
  const { fileName, summary, keyPoints, insights, documentType, confidenceScore = 98 } = data;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mt-4 w-full max-w-2xl overflow-hidden font-sans">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

      <div className="border-t border-slate-100 p-4 bg-slate-50/50 flex justify-between items-center">
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-navy-600 transition-colors">
            <Share2 size={14} /> Share Analysis
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-navy-600 transition-colors">
            <Save size={14} /> Export PDF
          </button>
        </div>
        <div className="text-[10px] text-slate-400 font-medium italic">
          Processed by Quinn Enterprise Engine v4.2
        </div>
      </div>
    </div>
  );
}

function ImageUI({ data }: { data: any }) {
  const { url, title, prompt } = data;
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mt-4 w-full max-w-lg overflow-hidden font-sans group">
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
      <div className="p-4 flex justify-between items-center bg-white">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">AI Generated Visualization</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-slate-400 hover:text-navy-600 hover:bg-slate-50 rounded-lg transition-colors">
            <Share2 size={16} />
          </button>
          <button className="p-2 text-slate-400 hover:text-navy-600 hover:bg-slate-50 rounded-lg transition-colors">
            <Save size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function QuoteBuilderUI({ data }: { data: any }) {
  const { clientName, propertyAddress, estimatedValue, loanAmount, interestRate, monthlyPayment, marketData } = data;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 mt-4 w-full max-w-lg overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-navy-900 p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-navy-300 text-xs font-bold uppercase tracking-widest mb-1">Loan Quote</p>
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
        <div className="grid grid-cols-2 gap-6 mb-8">
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

              <div className="grid grid-cols-2 gap-4 pt-2">
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

        <div className="mt-8 flex gap-3">
          <button className="flex-1 bg-navy-900 hover:bg-navy-800 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2">
            Generate PDF <FileText size={18} />
          </button>
          <button className="px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-all flex items-center justify-center">
            <Share2 size={18} />
          </button>
        </div>
        
        <p className="text-[10px] text-slate-400 text-center mt-6 flex items-center justify-center gap-1">
          <Info size={10} /> Live data provided by Google Search & Maps Grounding
        </p>
      </div>
    </div>
  );
}

function FreshIdeasUI({ data }: { data: any }) {
  const { title, ideas } = data;
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-4 w-full max-w-md">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-amber-100 p-2 rounded-lg">
          <Lightbulb size={20} className="text-amber-600" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{title}</h3>
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

function ChartUI({ data }: { data: any }) {
  const { chartType, title, data: chartData } = data;
  const maxValue = Math.max(...chartData.map((d: any) => d.value));
  const isLTV = title.toLowerCase().includes('ltv');

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 mt-4 w-full max-w-lg overflow-hidden font-sans animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{title}</h3>
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

      <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
        <div className="flex gap-4">
          {chartData.slice(0, 3).map((d: any, i: number) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chartType === 'pie' ? COLORS[i % COLORS.length] : '#0A2540' }} />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-[60px]">{d.name}</span>
            </div>
          ))}
        </div>
        <button className="text-[10px] font-bold text-navy-600 uppercase tracking-widest hover:underline">View Full Report</button>
      </div>
    </div>
  );
}

function CardUI({ data }: { data: any }) {
  const { title, description, metrics } = data;
  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 mt-4 w-full max-w-sm overflow-hidden font-sans animate-in zoom-in duration-500">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-navy-50 p-2 rounded-lg">
          <Info size={18} className="text-navy-600" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{title}</h3>
      </div>
      <p className="text-xs text-slate-500 mb-8 font-medium leading-relaxed">{description}</p>
      
      {metrics && metrics.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((m: any, i: number) => (
            <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-navy-200 transition-all group">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest group-hover:text-navy-400 transition-colors">{m.label}</p>
              <p className="text-xl font-bold text-navy-900 mt-1">{m.value}</p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 flex justify-end">
        <button className="text-[10px] font-bold text-navy-600 uppercase tracking-widest hover:underline flex items-center gap-1">
          Learn More <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

function DealUI({ data }: { data: any }) {
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-4 w-full max-w-md overflow-hidden font-sans relative">
      <div className="bg-[#0A2540] p-5 text-white flex justify-between items-center">
        <div>
          <p className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1">Pipeline</p>
          <h3 className="text-xl font-bold">Deal Management</h3>
        </div>
        <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
          <Briefcase size={20} className="text-slate-100" />
        </div>
      </div>
      
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {stages.map(stage => (
            <button
              key={stage}
              onClick={() => setFilter(stage)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border",
                filter === stage 
                  ? "bg-[#0A2540] text-white border-[#0A2540]" 
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              )}
            >
              {stage}
            </button>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Value</span>
          <span className="text-sm font-bold text-navy-900">${totalValue.toLocaleString()}</span>
        </div>
      </div>

      <div className="p-4 max-h-[400px] overflow-y-auto space-y-4">
        {filteredDeals.length > 0 ? filteredDeals.map((deal: any, idx: number) => (
          <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors bg-white shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-bold text-slate-900">{deal.clientName}</h4>
              <span className={cn(
                "text-[10px] font-bold px-2 py-1 rounded-full border uppercase tracking-wider",
                deal.stage === 'Closed Won' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                deal.stage === 'Closed Lost' ? "bg-red-50 text-red-700 border-red-200" :
                deal.stage === 'Negotiation' ? "bg-amber-50 text-amber-700 border-amber-200" :
                "bg-blue-50 text-blue-700 border-blue-200"
              )}>
                {deal.stage}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><DollarSign size={12}/> Value</p>
                <p className="text-sm font-bold text-slate-900">${deal.value?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><TrendingUp size={12}/> Prob.</p>
                <p className="text-sm font-bold text-emerald-600">{deal.probability !== undefined ? `${deal.probability}%` : 'N/A'}</p>
              </div>
            </div>
            
            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
              <div 
                className={cn(
                  "h-1.5 rounded-full",
                  deal.stage === 'Closed Won' ? "bg-emerald-500" :
                  deal.stage === 'Closed Lost' ? "bg-red-500" :
                  "bg-blue-600"
                )} 
                style={{ width: `${deal.probability || 50}%` }}
              ></div>
            </div>
            
            <button 
              onClick={() => handleSaveClick(dealsList.indexOf(deal))}
              disabled={savedDeals.includes(dealsList.indexOf(deal))}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savedDeals.includes(dealsList.indexOf(deal)) ? "Saved to Pipeline" : <>Save Deal <Save size={14} /></>}
            </button>
          </div>
        )) : (
          <div className="text-center py-8 text-slate-500 text-sm">
            No deals found in this stage.
          </div>
        )}
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

function EmailUI({ data }: { data: any }) {
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
    <div className="bg-white rounded-xl shadow-md border border-slate-200 mt-4 w-full max-w-lg overflow-hidden font-sans relative">
      {/* TQL Brand Header */}
      <div className="bg-[#0A2540] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Mail size={16} className="text-[#CBA052]" />
          <span className="text-xs font-bold uppercase tracking-widest text-white/90">TQL Email Builder</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
        </div>
      </div>
      
      <div className="p-0">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center text-sm flex-wrap gap-2">
          <span className="text-slate-400 font-medium w-16">To:</span>
          {recipients.map((r, i) => {
            const valid = isValidEmail(r);
            return (
              <span key={i} className={cn(
                "font-medium px-2 py-0.5 rounded text-xs flex items-center gap-1 border",
                valid ? "bg-slate-100 text-slate-800 border-transparent" : "bg-red-50 text-red-700 border-red-200"
              )}>
                {r}
                <button onClick={() => removeRecipient(i)} className={cn(
                  "transition-colors",
                  valid ? "text-slate-400 hover:text-slate-600" : "text-red-400 hover:text-red-600"
                )}>
                  <X size={12}/>
                </button>
              </span>
            );
          })}
          {isAddingRecipient ? (
            <div className="flex items-center gap-1">
              <input
                type="email"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="email@example.com"
                className="text-xs px-2 py-1 border border-slate-200 rounded outline-none focus:border-navy-500 w-40"
                autoFocus
              />
              <button onClick={addRecipient} className="text-navy-600 hover:bg-navy-50 p-1 rounded transition-colors">
                <Check size={14}/>
              </button>
              <button onClick={() => { setIsAddingRecipient(false); setNewRecipient(''); }} className="text-slate-400 hover:bg-slate-50 p-1 rounded transition-colors">
                <X size={14}/>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAddingRecipient(true)} 
              className="text-xs font-medium text-navy-600 bg-navy-50 hover:bg-navy-100 px-2 py-1 rounded flex items-center gap-1 transition-colors border border-navy-100"
            >
              <Plus size={12} /> Add Recipient
            </button>
          )}
        </div>
        
        <div className="px-5 py-3 border-b border-slate-100 flex items-center text-sm">
          <span className="text-slate-400 font-medium w-16">Subject:</span>
          <span className="text-slate-900 font-semibold">{subject}</span>
        </div>
        
        <div className="p-5 text-[13px] text-slate-700 whitespace-pre-wrap min-h-[120px] leading-relaxed">
          {body}
        </div>
        
        {attachments.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-wrap gap-2">
            {attachments.map((file, idx) => (
              <div key={idx} className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1.5 rounded-md text-xs text-slate-700 shadow-sm">
                <Paperclip size={12} className="text-slate-400" />
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button onClick={() => removeAttachment(idx)} className="text-slate-400 hover:text-red-500 ml-1 transition-colors">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <input 
          type="file" 
          multiple 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
        />
        <button 
          onClick={handleAttachmentClick}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-900 rounded-md transition-colors"
        >
          <Paperclip size={16} />
          <span>Add Attachment</span>
        </button>
        <div className="flex gap-2">
          <button className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-md transition-colors">Discard</button>
          <button 
            onClick={handleSendClick}
            disabled={isSent || recipients.length === 0}
            className="px-5 py-1.5 text-sm font-bold bg-[#0A2540] text-white hover:bg-[#0A2540]/90 rounded-md transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSent ? "Sent!" : <>Send <Send size={14} /></>}
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

function LeaderboardUI({ data }: { data: any }) {
  const { title, entries } = data;
  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 mt-4 w-full max-w-md overflow-hidden font-sans animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-lg">
            <Trophy size={20} className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{title}</h3>
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
      
      <button className="w-full mt-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-slate-100">
        View Full Leaderboard
      </button>
    </div>
  );
}
