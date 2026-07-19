import { useState } from 'react';
import { 
  Landmark, AlertTriangle, ShieldCheck 
} from 'lucide-react';
import type { IncomeSources, ClaimedDeductions, CalculationResult } from '../utils/taxCalculator';

interface LoanCenterProps {
  income: IncomeSources;
  deductions: ClaimedDeductions;
  calcResult: CalculationResult;
  onUpdateDeductions: (deductions: Partial<ClaimedDeductions>) => void;
}

export default function LoanCenter({
  income,
  deductions,
  calcResult,
  onUpdateDeductions
}: LoanCenterProps) {
  const [loanAmount, setLoanAmount] = useState<number>(3000000); // 30 Lakhs
  const [interestRate, setInterestRate] = useState<number>(8.5); // 8.5%
  const [tenureYears, setTenureYears] = useState<number>(20); // 20 years
  const [prepayAmount, setPrepayAmount] = useState<number>(50000); // ₹50k annual prepayment

  // EMI Math
  const calculateEMI = () => {
    const P = loanAmount;
    const r = (interestRate / 12) / 100;
    const n = tenureYears * 12;
    if (r === 0) return P / n;
    
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return emi;
  };

  const emi = calculateEMI();
  const totalMonths = tenureYears * 12;
  const totalPayable = emi * totalMonths;
  const totalInterest = totalPayable - loanAmount;

  // Prepayment Math (Approximated)
  const calculatePrepaySavings = () => {
    const annualSavings = prepayAmount;
    if (annualSavings <= 0) return { monthsSaved: 0, interestSaved: 0 };
    
    // Simple amortization reduction simulation
    const r = (interestRate / 12) / 100;
    let monthsElapsed = 0;
    let regularPaidInterest = 0;
    let prepayPaidInterest = 0;

    // Normal Interest paid (no prepayment)
    let balNormal = loanAmount;
    for (let m = 0; m < totalMonths; m++) {
      const interest = balNormal * r;
      const principal = emi - interest;
      regularPaidInterest += interest;
      balNormal = Math.max(0, balNormal - principal);
    }

    // Amortization with annual prepayment
    let balPre = loanAmount;
    let m = 0;
    while (balPre > 0 && m < totalMonths) {
      // Annual prepayment applied at month 12, 24, etc.
      if (m > 0 && m % 12 === 0) {
        balPre = Math.max(0, balPre - annualSavings);
      }
      
      const interest = balPre * r;
      const principal = emi - interest;
      prepayPaidInterest += interest;
      balPre = Math.max(0, balPre - principal);
      
      monthsElapsed++;
      if (balPre <= 0) break;
    }

    const monthsSaved = totalMonths - monthsElapsed;
    const interestSaved = Math.max(0, regularPaidInterest - prepayPaidInterest);

    return {
      monthsSaved,
      interestSaved
    };
  };

  const prepaySavings = calculatePrepaySavings();

  // Loan eligibility based on 50% FOIR (Fixed Obligation to Income Ratio) of gross income
  const monthlyGrossIncome = (income.salary + income.businessIncome) / 12;
  const eligibleMonthlyEMI = monthlyGrossIncome * 0.50; // max EMI allowed
  
  const estimateEligibleLoan = () => {
    const P_max = eligibleMonthlyEMI / (((interestRate / 12) / 100) * Math.pow(1 + ((interestRate / 12) / 100), totalMonths) / (Math.pow(1 + ((interestRate / 12) / 100), totalMonths) - 1));
    return Math.max(0, Math.round(P_max));
  };

  const maxEligibleLoan = estimateEligibleLoan();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr', gap: '24px' }} className="grid-responsive-loans">
      
      {/* Left Column: Sliders */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <Landmark size={20} style={{ color: 'var(--accent-primary)' }} />
          EMI & Prepayment Simulator
        </h3>

        {/* Loan Amount */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Loan Principal Amount</span>
            <strong style={{ color: 'var(--text-primary)' }}>₹{loanAmount.toLocaleString()}</strong>
          </div>
          <input 
            type="range" 
            min="500000" 
            max="15000000" 
            step="100000" 
            value={loanAmount} 
            onChange={(e) => setLoanAmount(parseInt(e.target.value))}
          />
        </div>

        {/* Interest Rate */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Interest Rate (p.a.)</span>
            <strong style={{ color: 'var(--text-primary)' }}>{interestRate}%</strong>
          </div>
          <input 
            type="range" 
            min="5" 
            max="18" 
            step="0.1" 
            value={interestRate} 
            onChange={(e) => setInterestRate(parseFloat(e.target.value))}
          />
        </div>

        {/* Tenure */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Tenure (Years)</span>
            <strong style={{ color: 'var(--text-primary)' }}>{tenureYears} Years</strong>
          </div>
          <input 
            type="range" 
            min="1" 
            max="30" 
            step="1" 
            value={tenureYears} 
            onChange={(e) => setTenureYears(parseInt(e.target.value))}
          />
        </div>

        {/* Prepayment amount */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Annual Prepayment</span>
            <strong style={{ color: 'var(--text-primary)' }}>₹{prepayAmount.toLocaleString()}</strong>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1000000" 
            step="10000" 
            value={prepayAmount} 
            onChange={(e) => setPrepayAmount(parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* Right Column: Outcomes & Tax warnings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Calculation Summary */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Amortization Breakdown</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'var(--bg-secondary)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>MONTHLY EMI</span>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px', color: 'var(--accent-primary)' }}>
                ₹{Math.round(emi).toLocaleString()}
              </h4>
            </div>
            <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'var(--bg-secondary)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TOTAL INTEREST</span>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px' }}>
                ₹{Math.round(totalInterest).toLocaleString()}
              </h4>
            </div>
          </div>

          {/* Prepayment benefits */}
          {prepayAmount > 0 && (
            <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} />
                Prepayment Benefit
              </h5>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                By paying ₹{prepayAmount.toLocaleString()} extra annually, you save **₹{Math.round(prepaySavings.interestSaved).toLocaleString()}** in interest and pay off your loan **{Math.round(prepaySavings.monthsSaved / 12)} Years** sooner!
              </div>
            </div>
          )}
        </div>

        {/* Home Loan Tax Benefits Panel */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '12px' }}>Home Loan Tax Exemption Benefits</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Section 24(b):</span>
              <span style={{ color: 'var(--text-secondary)' }}>Exempt interest paid up to **₹2,00,000** annually.</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Section 80C:</span>
              <span style={{ color: 'var(--text-secondary)' }}>Exempt principal component paid up to **₹1,50,000** annually.</span>
            </div>

            {/* Sync button to claiming deduction */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Current Claimed Interest: ₹{deductions.section24B_homeLoan.toLocaleString()}
              </span>
              <button 
                className="btn btn-outline" 
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                onClick={() => onUpdateDeductions({ section24B_homeLoan: Math.min(200000, Math.round(emi * 12 * 0.7)) })} // estimate interest component
              >
                Sync with Tax return
              </button>
            </div>

            {/* Dynamic Regime Warning */}
            {calcResult.optimalRegime === 'newRegime' ? (
              <div className="alert-box alert-warning" style={{ fontSize: '0.75rem' }}>
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Tax Alert:</strong> You are currently optimal under the New Tax Regime. Home loan tax exemptions under Section 24(b) and 80C are **not allowed** in the New Regime.
                </span>
              </div>
            ) : (
              <div className="alert-box alert-success" style={{ fontSize: '0.75rem' }}>
                <ShieldCheck size={18} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Deduction Mapped:</strong> Under your Old Tax Regime selection, your home loan deductions are reducing your taxable income by up to ₹3,50,000.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Max Eligibility */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '8px' }}>Estimated Home Loan Eligibility</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Based on your declared gross earnings of ₹{(income.salary + income.businessIncome).toLocaleString()}.
          </p>
          <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>MAX ESTIMATED HOME LOAN</span>
              <strong style={{ fontSize: '1.4rem', color: 'var(--accent-success)', fontWeight: 700 }}>
                ₹{maxEligibleLoan.toLocaleString()}
              </strong>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Assumed FOIR @ 50%
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
