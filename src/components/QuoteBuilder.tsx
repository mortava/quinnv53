import React, { useState, useEffect } from 'react';
import { ChevronDown, Info, Calculator, FileText, DollarSign, Percent, Home, Briefcase, ArrowRight, X, Printer, Share2, Save, Plus, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast, Toaster } from 'sonner';

// Reference Data from CSV
const LOAN_PROGRAMS = [
  { name: 'Conventional 40 Year Fixed', term: 480, type: 'Fixed' },
  { name: 'Conventional 30 Year Fixed', term: 360, type: 'Fixed' },
  { name: 'Conventional 20 Year Fixed', term: 240, type: 'Fixed' },
  { name: 'Conventional 15 Year Fixed', term: 180, type: 'Fixed' },
  { name: 'FHA 30 Year Fixed', term: 360, type: 'Fixed' },
  { name: 'DSCR 40 Year Fixed', term: 480, type: 'Fixed' },
  { name: 'DSCR 30 Year Fixed', term: 360, type: 'Fixed' },
  { name: 'DSCR 20 Year Fixed', term: 240, type: 'Fixed' },
  { name: 'DSCR 15 Year Fixed', term: 180, type: 'Fixed' },
  { name: 'DSCR 40 Year Fixed IO', term: 480, type: 'IO' },
  { name: 'DSCR 30 Year Fixed IO', term: 360, type: 'IO' },
  { name: 'DSCR 20 Year Fixed IO', term: 240, type: 'IO' },
  { name: 'DSCR 15 Year Fixed IO', term: 180, type: 'IO' },
  { name: 'Foreign National DSCR 30 Year Fixed', term: 360, type: 'Fixed' },
  { name: 'Full Doc 40 Year Fixed', term: 480, type: 'Fixed' },
  { name: 'Full Doc 30 Year Fixed', term: 360, type: 'Fixed' },
  { name: 'Full Doc 20 Year Fixed', term: 240, type: 'Fixed' },
  { name: 'Full Doc 15 Year Fixed', term: 180, type: 'Fixed' },
  { name: 'Full Doc 40 Year Fixed IO', term: 480, type: 'IO' },
  { name: 'Full Doc 30 Year Fixed IO', term: 360, type: 'IO' },
  { name: 'Full Doc 20 Year Fixed IO', term: 240, type: 'IO' },
  { name: 'Full Doc 15 Year Fixed IO', term: 180, type: 'IO' },
  { name: 'VA 30 Year Fixed', term: 360, type: 'Fixed' },
  { name: 'Bank Statement 30 Year Fixed', term: 360, type: 'Fixed' },
  { name: 'Alt Doc 30 Year Fixed', term: 360, type: 'Fixed' },
];

const PROPERTY_TYPES = ['SFR', 'Duplex (2 Units)', 'Triplex (3 Units)', 'Quadplex (4 Units)', '5-9 Unit', 'Condo', 'Condotel', 'Townhome', 'Manufactured'];
const TRANSACTION_TYPES = ['Purchase', 'Refinance'];
const REFINANCE_TYPES = ['Rate & Term', 'Cashout'];
const OCCUPANCY_TYPES = ['Primary', '2nd Home', 'Investment'];
const INCOME_DOC_TYPES = ['No Income Needed', 'Full Documentation', 'Bank Statements', 'Alt Documentation'];
const PPP_OPTIONS = ['0 Yr PPP', '1 YR PPP', '2 YR PPP', '3 YR PPP', '4 YR PPP', '5 YR PPP'];

interface ScenarioData {
  id: string;
  // Property & Loan Details
  transactionType: string;
  propertyAddress: string;
  loanProgram: string;
  interestRate: number;
  creditScore: number;
  propertyType: string;
  occupancy: string;
  incomeDocumentation: string;
  pppPeriod: string;

  // Purchase Details
  purchasePrice: number;
  downPaymentPercent: number;

  // Refinance Details
  refinanceType: string;
  currentPropertyValue: number;
  ltvPercent: number;
  currentLoanPayoff: number;

  // Cost, Income & Fee Inputs
  insuranceAnnual: number;
  propertyTaxRate: number;
  hoaMonthly: number;
  monthlyRents: number;
  miRate: number;
  sellerCreditPercent: number;
  escrowTitleFees: number;
  tqlComplianceFee: number;
  tqlLowerRateOption: number;
  discountPointsPercent: number;
  pitiaReserveMonths: number;
}

const initialScenario: ScenarioData = {
  id: '1',
  transactionType: 'Purchase',
  propertyAddress: '',
  loanProgram: 'Conventional 30 Year Fixed',
  interestRate: 6.5,
  creditScore: 740,
  propertyType: 'SFR',
  occupancy: 'Primary',
  incomeDocumentation: 'Full Documentation',
  pppPeriod: '0 Yr PPP',
  purchasePrice: 500000,
  downPaymentPercent: 20,
  refinanceType: 'Rate & Term',
  currentPropertyValue: 500000,
  ltvPercent: 80,
  currentLoanPayoff: 300000,
  insuranceAnnual: 1200,
  propertyTaxRate: 1.25,
  hoaMonthly: 0,
  monthlyRents: 0,
  miRate: 0,
  sellerCreditPercent: 0,
  escrowTitleFees: 3500,
  tqlComplianceFee: 995,
  tqlLowerRateOption: 0,
  discountPointsPercent: 0,
  pitiaReserveMonths: 6,
};

export function QuoteBuilder({ onClose }: { onClose?: () => void }) {
  const [scenarios, setScenarios] = useState<ScenarioData[]>(() => {
    const saved = localStorage.getItem('tql_quote_scenarios');
    return saved ? JSON.parse(saved) : [{ ...initialScenario, id: crypto.randomUUID() }];
  });

  const updateScenario = (index: number, field: keyof ScenarioData, value: any) => {
    const newScenarios = [...scenarios];
    newScenarios[index] = { ...newScenarios[index], [field]: value };
    setScenarios(newScenarios);
  };

  const addScenario = () => {
    if (scenarios.length >= 3) {
      toast.error("Maximum 3 scenarios allowed for comparison.");
      return;
    }
    const lastScenario = scenarios[scenarios.length - 1];
    setScenarios([...scenarios, { ...lastScenario, id: crypto.randomUUID() }]);
    toast.success("Added new scenario for comparison.");
  };

  const removeScenario = (index: number) => {
    if (scenarios.length <= 1) return;
    const newScenarios = scenarios.filter((_, i) => i !== index);
    setScenarios(newScenarios);
    toast.info("Scenario removed.");
  };

  const handleSave = () => {
    localStorage.setItem('tql_quote_scenarios', JSON.stringify(scenarios));
    toast.success("Quote saved successfully to local storage.");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: 'TQL Quote Builder',
      text: `Loan Quote for ${scenarios[0].propertyAddress || 'Property'}`,
      url: window.location.href
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(JSON.stringify(scenarios, null, 2));
        toast.success("Quote data copied to clipboard.");
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const calculateResults = (data: ScenarioData) => {
    const isPurchase = data.transactionType === 'Purchase';
    const propertyValue = isPurchase ? data.purchasePrice : data.currentPropertyValue;
    
    let baseLoanAmount = 0;
    let downPaymentAmount = 0;
    
    if (isPurchase) {
      downPaymentAmount = (data.purchasePrice * data.downPaymentPercent) / 100;
      baseLoanAmount = data.purchasePrice - downPaymentAmount;
    } else {
      baseLoanAmount = (data.currentPropertyValue * data.ltvPercent) / 100;
      downPaymentAmount = data.currentPropertyValue - baseLoanAmount;
    }

    const ltv = (baseLoanAmount / propertyValue) * 100;
    
    // Monthly Payment Calculations
    const loanProgram = LOAN_PROGRAMS.find(p => p.name === data.loanProgram) || LOAN_PROGRAMS[1];
    const monthlyRate = data.interestRate / 100 / 12;
    const numberOfPayments = loanProgram.term;
    
    let principalAndInterest = 0;
    if (loanProgram.type === 'IO') {
      principalAndInterest = baseLoanAmount * monthlyRate;
    } else {
      principalAndInterest = baseLoanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }

    const monthlyInsurance = data.insuranceAnnual / 12;
    const monthlyTaxes = (propertyValue * (data.propertyTaxRate / 100)) / 12;
    const monthlyMI = (baseLoanAmount * (data.miRate / 100)) / 12;
    const totalMonthlyPayment = principalAndInterest + monthlyInsurance + monthlyTaxes + monthlyMI + data.hoaMonthly;

    // DSCR Analysis
    const dscrRatio = totalMonthlyPayment > 0 ? data.monthlyRents / totalMonthlyPayment : 0;
    const netCashFlow = data.monthlyRents - totalMonthlyPayment;

    // Closing Costs
    const tqlFlatFee = 0; // Placeholder
    const tqlProcessingFee = data.tqlComplianceFee;
    const thirdPartyClosing = 2500; // Placeholder
    const titleFees = data.escrowTitleFees;
    const prePaids = (monthlyInsurance * 12) + (monthlyTaxes * 6); // 12 months insurance, 6 months taxes estimate
    const discountPointsFee = (baseLoanAmount * data.discountPointsPercent) / 100;
    const sellerCreditAmount = (propertyValue * data.sellerCreditPercent) / 100;
    
    const totalClosingCosts = tqlFlatFee + tqlProcessingFee + thirdPartyClosing + titleFees + prePaids + discountPointsFee;
    const cashToClose = (isPurchase ? downPaymentAmount : (data.currentLoanPayoff - baseLoanAmount)) + totalClosingCosts - sellerCreditAmount;

    const pitiaReservesRequired = totalMonthlyPayment * data.pitiaReserveMonths;

    return {
      propertyValue,
      downPaymentAmount,
      baseLoanAmount,
      ltv,
      principalAndInterest,
      monthlyInsurance,
      monthlyTaxes,
      monthlyMI,
      totalMonthlyPayment,
      dscrRatio,
      netCashFlow,
      cashToClose,
      pitiaReservesRequired,
      discountPointsFee,
      prePaids
    };
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden animate-in fade-in duration-500 print:bg-white print:overflow-visible">
      <Toaster position="top-right" richColors />
      {/* Header */}
      <header className="bg-navy-900 text-white p-4 flex items-center justify-between shadow-md shrink-0 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Calculator className="text-navy-900" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">QUOTE BUILDER</h1>
            <p className="text-xs text-navy-200 uppercase tracking-widest font-medium">Payment Estimator</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Save Quote">
            <Save size={20} />
          </button>
          <button onClick={handlePrint} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Print PDF">
            <Printer size={20} />
          </button>
          <button onClick={handleShare} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Share">
            <Share2 size={20} />
          </button>
          {onClose && (
            <button onClick={onClose} className="ml-2 p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X size={20} />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-6 print:p-0">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Main Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-navy-800 text-white print:bg-slate-800">
                  <th className="p-4 text-left font-bold w-1/4">PROPERTY & LOAN DETAILS</th>
                  {scenarios.map((_, i) => (
                    <th key={i} className="p-4 text-center font-bold border-l border-navy-700 relative group">
                      <div className="flex items-center justify-center gap-2">
                        Scenario {i + 1}
                        {scenarios.length > 1 && (
                          <button 
                            onClick={() => removeScenario(i)}
                            className="p-1 hover:bg-red-500/20 rounded text-red-300 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  {scenarios.length < 3 && (
                    <th className="p-4 text-center border-l border-navy-700 print:hidden">
                      <button 
                        onClick={addScenario}
                        className="flex items-center justify-center gap-2 mx-auto px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-xs"
                      >
                        <Plus size={14} /> Add Scenario
                      </button>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {/* Property & Loan Details Section */}
                <TableRow label="Transaction Type">
                  {scenarios.map((s, i) => (
                    <SelectCell 
                      key={s.id} 
                      value={s.transactionType} 
                      options={TRANSACTION_TYPES} 
                      onChange={(v) => updateScenario(i, 'transactionType', v)} 
                    />
                  ))}
                </TableRow>
                <TableRow label="Property Address">
                  {scenarios.map((s, i) => (
                    <InputCell 
                      key={s.id} 
                      value={s.propertyAddress} 
                      placeholder="Enter address..."
                      onChange={(v) => updateScenario(i, 'propertyAddress', v)} 
                    />
                  ))}
                </TableRow>
                <TableRow label="Loan Program">
                  {scenarios.map((s, i) => (
                    <SelectCell 
                      key={s.id} 
                      value={s.loanProgram} 
                      options={LOAN_PROGRAMS.map(p => p.name)} 
                      onChange={(v) => updateScenario(i, 'loanProgram', v)} 
                    />
                  ))}
                </TableRow>
                <TableRow label="Interest Rate (Live Quote)">
                  {scenarios.map((s, i) => (
                    <NumberCell 
                      key={s.id} 
                      value={s.interestRate} 
                      suffix="%"
                      onChange={(v) => updateScenario(i, 'interestRate', v)} 
                    />
                  ))}
                </TableRow>
                <TableRow label="Credit Score">
                  {scenarios.map((s, i) => (
                    <NumberCell 
                      key={s.id} 
                      value={s.creditScore} 
                      onChange={(v) => updateScenario(i, 'creditScore', v)} 
                    />
                  ))}
                </TableRow>
                <TableRow label="Property Type">
                  {scenarios.map((s, i) => (
                    <SelectCell 
                      key={s.id} 
                      value={s.propertyType} 
                      options={PROPERTY_TYPES} 
                      onChange={(v) => updateScenario(i, 'propertyType', v)} 
                    />
                  ))}
                </TableRow>
                <TableRow label="Occupancy">
                  {scenarios.map((s, i) => (
                    <SelectCell 
                      key={s.id} 
                      value={s.occupancy} 
                      options={OCCUPANCY_TYPES} 
                      onChange={(v) => updateScenario(i, 'occupancy', v)} 
                    />
                  ))}
                </TableRow>
                <TableRow label="Income Documentation">
                  {scenarios.map((s, i) => (
                    <SelectCell 
                      key={s.id} 
                      value={s.incomeDocumentation} 
                      options={INCOME_DOC_TYPES} 
                      onChange={(v) => updateScenario(i, 'incomeDocumentation', v)} 
                    />
                  ))}
                </TableRow>
                <TableRow label="Pre-Payment Penalty Period">
                  {scenarios.map((s, i) => (
                    <SelectCell 
                      key={s.id} 
                      value={s.pppPeriod} 
                      options={PPP_OPTIONS} 
                      onChange={(v) => updateScenario(i, 'pppPeriod', v)} 
                    />
                  ))}
                </TableRow>

                {/* Purchase Details Section */}
                <SectionHeader label="PURCHASE DETAILS (if Transaction Type = Purchase)" colSpan={scenarios.length + 1} />
                <TableRow label="Purchase Price">
                  {scenarios.map((s, i) => (
                    <NumberCell 
                      key={s.id} 
                      value={s.purchasePrice} 
                      prefix="$"
                      disabled={s.transactionType !== 'Purchase'}
                      onChange={(v) => updateScenario(i, 'purchasePrice', v)} 
                    />
                  ))}
                </TableRow>
                <TableRow label="Down Payment (%)">
                  {scenarios.map((s, i) => (
                    <NumberCell 
                      key={s.id} 
                      value={s.downPaymentPercent} 
                      suffix="%"
                      disabled={s.transactionType !== 'Purchase'}
                      onChange={(v) => updateScenario(i, 'downPaymentPercent', v)} 
                    />
                  ))}
                </TableRow>

                {/* Refinance Details Section */}
                <SectionHeader label="REFINANCE DETAILS (if Transaction Type = Refinance)" colSpan={scenarios.length + 1} />
                <TableRow label="Refinance Type">
                  {scenarios.map((s, i) => (
                    <SelectCell 
                      key={s.id} 
                      value={s.refinanceType} 
                      options={REFINANCE_TYPES} 
                      disabled={s.transactionType !== 'Refinance'}
                      onChange={(v) => updateScenario(i, 'refinanceType', v)} 
                    />
                  ))}
                </TableRow>
                <TableRow label="Current Property Value">
                  {scenarios.map((s, i) => (
                    <NumberCell 
                      key={s.id} 
                      value={s.currentPropertyValue} 
                      prefix="$"
                      disabled={s.transactionType !== 'Refinance'}
                      onChange={(v) => updateScenario(i, 'currentPropertyValue', v)} 
                    />
                  ))}
                </TableRow>
                <TableRow label="Loan-to-Value (LTV %)">
                  {scenarios.map((s, i) => (
                    <NumberCell 
                      key={s.id} 
                      value={s.ltvPercent} 
                      suffix="%"
                      disabled={s.transactionType !== 'Refinance'}
                      onChange={(v) => updateScenario(i, 'ltvPercent', v)} 
                    />
                  ))}
                </TableRow>
                <TableRow label="Current Loan Payoff">
                  {scenarios.map((s, i) => (
                    <NumberCell 
                      key={s.id} 
                      value={s.currentLoanPayoff} 
                      prefix="$"
                      disabled={s.transactionType !== 'Refinance'}
                      onChange={(v) => updateScenario(i, 'currentLoanPayoff', v)} 
                    />
                  ))}
                </TableRow>

                {/* Cost, Income & Fee Inputs Section */}
                <SectionHeader label="COST, INCOME & FEE INPUTS" colSpan={scenarios.length + 1} />
                <TableRow label="Insurance (Annual Premium)">
                  {scenarios.map((s, i) => (
                    <NumberCell 
                      key={s.id} 
                      value={s.insuranceAnnual} 
                      prefix="$"
                      onChange={(v) => updateScenario(i, 'insuranceAnnual', v)} 
                    />
                  ))}
                </TableRow>
                <TableRow label="Property Tax Rate (Annual %)">
                  {scenarios.map((s, i) => (
                    <NumberCell 
                      key={s.id} 
                      value={s.propertyTaxRate} 
                      suffix="%"
                      onChange={(v) => updateScenario(i, 'propertyTaxRate', v)} 
                    />
                  ))}
                </TableRow>
                <TableRow label="HOA Dues (Monthly)">
                  {scenarios.map((s, i) => (
                    <NumberCell 
                      key={s.id} 
                      value={s.hoaMonthly} 
                      prefix="$"
                      onChange={(v) => updateScenario(i, 'hoaMonthly', v)} 
                    />
                  ))}
                </TableRow>
                <TableRow label="Monthly Rents / Income Est.">
                  {scenarios.map((s, i) => (
                    <NumberCell 
                      key={s.id} 
                      value={s.monthlyRents} 
                      prefix="$"
                      onChange={(v) => updateScenario(i, 'monthlyRents', v)} 
                    />
                  ))}
                </TableRow>
                <TableRow label="MI / UFMIP Rate (%)">
                  {scenarios.map((s, i) => (
                    <NumberCell 
                      key={s.id} 
                      value={s.miRate} 
                      suffix="%"
                      onChange={(v) => updateScenario(i, 'miRate', v)} 
                    />
                  ))}
                </TableRow>
                <TableRow label="Seller Credit (%)">
                  {scenarios.map((s, i) => (
                    <NumberCell 
                      key={s.id} 
                      value={s.sellerCreditPercent} 
                      suffix="%"
                      onChange={(v) => updateScenario(i, 'sellerCreditPercent', v)} 
                    />
                  ))}
                </TableRow>
                <TableRow label="Escrow / Title Fee Est.">
                  {scenarios.map((s, i) => (
                    <NumberCell 
                      key={s.id} 
                      value={s.escrowTitleFees} 
                      prefix="$"
                      onChange={(v) => updateScenario(i, 'escrowTitleFees', v)} 
                    />
                  ))}
                </TableRow>
                <TableRow label="TQL Compliance UW Fee">
                  {scenarios.map((s, i) => (
                    <NumberCell 
                      key={s.id} 
                      value={s.tqlComplianceFee} 
                      prefix="$"
                      onChange={(v) => updateScenario(i, 'tqlComplianceFee', v)} 
                    />
                  ))}
                </TableRow>
                <TableRow label="TQL Lower Rate Option (%)">
                  {scenarios.map((s, i) => (
                    <NumberCell 
                      key={s.id} 
                      value={s.tqlLowerRateOption} 
                      suffix="%"
                      onChange={(v) => updateScenario(i, 'tqlLowerRateOption', v)} 
                    />
                  ))}
                </TableRow>
                <TableRow label="Discount Points (%)">
                  {scenarios.map((s, i) => (
                    <NumberCell 
                      key={s.id} 
                      value={s.discountPointsPercent} 
                      suffix="%"
                      onChange={(v) => updateScenario(i, 'discountPointsPercent', v)} 
                    />
                  ))}
                </TableRow>
                <TableRow label="PITIA Reserve Months">
                  {scenarios.map((s, i) => (
                    <NumberCell 
                      key={s.id} 
                      value={s.pitiaReserveMonths} 
                      onChange={(v) => updateScenario(i, 'pitiaReserveMonths', v)} 
                    />
                  ))}
                </TableRow>

                {/* Calculated Results Section */}
                <tr className="bg-navy-900 text-white">
                  <th colSpan={scenarios.length + 1} className="p-3 text-center font-bold uppercase tracking-widest text-xs">▼ CALCULATED RESULTS ▼</th>
                </tr>
                <SectionHeader label="LOAN SUMMARY" colSpan={scenarios.length + 1} />
                <TableRow label="Loan Program">
                  {scenarios.map((s) => <ResultCell key={s.id} value={s.loanProgram} />)}
                </TableRow>
                <TableRow label="Credit Score">
                  {scenarios.map((s) => <ResultCell key={s.id} value={s.creditScore} />)}
                </TableRow>
                <TableRow label="Property Type">
                  {scenarios.map((s) => <ResultCell key={s.id} value={s.propertyType} />)}
                </TableRow>
                <TableRow label="Occupancy">
                  {scenarios.map((s) => <ResultCell key={s.id} value={s.occupancy} />)}
                </TableRow>
                <TableRow label="Down Payment / LTV">
                  {scenarios.map((s) => {
                    const res = calculateResults(s);
                    return <ResultCell key={s.id} value={`${s.transactionType === 'Purchase' ? s.downPaymentPercent : res.ltv.toFixed(1)}%`} />;
                  })}
                </TableRow>
                <TableRow label="Transaction Type">
                  {scenarios.map((s) => <ResultCell key={s.id} value={s.transactionType} />)}
                </TableRow>

                <SectionHeader label="LOAN AMOUNTS" colSpan={scenarios.length + 1} />
                <TableRow label="Purchase Price / Current Value">
                  {scenarios.map((s) => {
                    const res = calculateResults(s);
                    return <ResultCell key={s.id} value={formatCurrency(res.propertyValue)} />;
                  })}
                </TableRow>
                <TableRow label="Down Payment / Payoff">
                  {scenarios.map((s) => {
                    const res = calculateResults(s);
                    return <ResultCell key={s.id} value={formatCurrency(s.transactionType === 'Purchase' ? res.downPaymentAmount : s.currentLoanPayoff)} />;
                  })}
                </TableRow>
                <TableRow label="Base Loan Amount">
                  {scenarios.map((s) => {
                    const res = calculateResults(s);
                    return <ResultCell key={s.id} value={formatCurrency(res.baseLoanAmount)} />;
                  })}
                </TableRow>
                <TableRow label="Loan-to-Value (LTV)">
                  {scenarios.map((s) => {
                    const res = calculateResults(s);
                    return <ResultCell key={s.id} value={`${res.ltv.toFixed(1)}%`} />;
                  })}
                </TableRow>

                <SectionHeader label="MONTHLY PAYMENT DETAILS" colSpan={scenarios.length + 1} />
                <TableRow label="Principal & Interest / IO">
                  {scenarios.map((s) => {
                    const res = calculateResults(s);
                    return <ResultCell key={s.id} value={formatCurrency(res.principalAndInterest)} />;
                  })}
                </TableRow>
                <TableRow label="Insurance (Monthly)">
                  {scenarios.map((s) => {
                    const res = calculateResults(s);
                    return <ResultCell key={s.id} value={formatCurrency(res.monthlyInsurance)} />;
                  })}
                </TableRow>
                <TableRow label="Taxes (Monthly)">
                  {scenarios.map((s) => {
                    const res = calculateResults(s);
                    return <ResultCell key={s.id} value={formatCurrency(res.monthlyTaxes)} />;
                  })}
                </TableRow>
                <TableRow label="Mortgage Insurance (Monthly)">
                  {scenarios.map((s) => {
                    const res = calculateResults(s);
                    return <ResultCell key={s.id} value={formatCurrency(res.monthlyMI)} />;
                  })}
                </TableRow>
                <TableRow label="HOA (Monthly)">
                  {scenarios.map((s) => <ResultCell key={s.id} value={formatCurrency(s.hoaMonthly)} />)}
                </TableRow>
                <TableRow label="TOTAL Monthly Payment" highlight>
                  {scenarios.map((s) => {
                    const res = calculateResults(s);
                    return <ResultCell key={s.id} value={formatCurrency(res.totalMonthlyPayment)} highlight />;
                  })}
                </TableRow>

                <SectionHeader label="INVESTMENT / DSCR ANALYSIS" colSpan={scenarios.length + 1} />
                <TableRow label="Monthly Rents">
                  {scenarios.map((s) => <ResultCell key={s.id} value={formatCurrency(s.monthlyRents)} />)}
                </TableRow>
                <TableRow label="DSCR Ratio">
                  {scenarios.map((s) => {
                    const res = calculateResults(s);
                    return <ResultCell key={s.id} value={res.dscrRatio.toFixed(2)} highlight={res.dscrRatio >= 1.2} />;
                  })}
                </TableRow>
                <TableRow label="Monthly Net Cash Flow">
                  {scenarios.map((s) => {
                    const res = calculateResults(s);
                    return <ResultCell key={s.id} value={formatCurrency(res.netCashFlow)} highlight={res.netCashFlow > 0} />;
                  })}
                </TableRow>

                <SectionHeader label="CLOSING COST BREAKDOWN" colSpan={scenarios.length + 1} />
                <TableRow label="TQL Processing / UW Fee">
                  {scenarios.map((s) => <ResultCell key={s.id} value={formatCurrency(s.tqlComplianceFee)} />)}
                </TableRow>
                <TableRow label="Escrow Payment at Closing (G)">
                  {scenarios.map((s) => {
                    const res = calculateResults(s);
                    return <ResultCell key={s.id} value={formatCurrency(res.prePaids)} />;
                  })}
                </TableRow>
                <TableRow label="Cash to Close Est." highlight>
                  {scenarios.map((s) => {
                    const res = calculateResults(s);
                    return <ResultCell key={s.id} value={formatCurrency(res.cashToClose)} highlight />;
                  })}
                </TableRow>
                <TableRow label="PITIA Reserves Required">
                  {scenarios.map((s) => {
                    const res = calculateResults(s);
                    return <ResultCell key={s.id} value={formatCurrency(res.pitiaReservesRequired)} />;
                  })}
                </TableRow>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function TableRow({ label, children, highlight }: { label: string, children: React.ReactNode, highlight?: boolean }) {
  return (
    <tr className={cn("border-b border-slate-100 hover:bg-slate-50/50 transition-colors", highlight && "bg-navy-50 font-bold")}>
      <td className="p-3 font-medium text-slate-700">{label}</td>
      {children}
    </tr>
  );
}

function SectionHeader({ label, colSpan }: { label: string, colSpan: number }) {
  return (
    <tr className="bg-slate-100">
      <td colSpan={colSpan} className="p-2 px-4 font-bold text-[11px] text-slate-500 uppercase tracking-wider">{label}</td>
    </tr>
  );
}

function InputCell({ value, placeholder, onChange }: { value: string, placeholder?: string, onChange: (v: string) => void }) {
  return (
    <td className="p-1 border-l border-slate-100">
      <input 
        type="text" 
        value={value} 
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 bg-transparent border-none focus:ring-0 text-center text-slate-800 placeholder:text-slate-300"
      />
    </td>
  );
}

function NumberCell({ value, prefix, suffix, disabled, onChange }: { value: number, prefix?: string, suffix?: string, disabled?: boolean, onChange: (v: number) => void }) {
  return (
    <td className={cn("p-1 border-l border-slate-100", disabled && "bg-slate-50")}>
      <div className="flex items-center justify-center gap-1">
        {prefix && <span className="text-slate-400">{prefix}</span>}
        <input 
          type="number" 
          value={value} 
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-20 p-2 bg-transparent border-none focus:ring-0 text-center text-slate-800 disabled:text-slate-300"
        />
        {suffix && <span className="text-slate-400">{suffix}</span>}
      </div>
    </td>
  );
}

function SelectCell({ value, options, disabled, onChange }: { value: string, options: string[], disabled?: boolean, onChange: (v: string) => void }) {
  return (
    <td className={cn("p-1 border-l border-slate-100", disabled && "bg-slate-50")}>
      <select 
        value={value} 
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 bg-transparent border-none focus:ring-0 text-center text-slate-800 appearance-none cursor-pointer disabled:text-slate-300 disabled:cursor-not-allowed"
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </td>
  );
}

function ResultCell({ value, highlight }: { value: string | number, highlight?: boolean }) {
  return (
    <td className={cn("p-3 border-l border-slate-100 text-center", highlight ? "text-navy-700 font-bold" : "text-slate-600")}>
      {value}
    </td>
  );
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val);
}
