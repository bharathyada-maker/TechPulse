import { useState } from 'react';
import { 
  Award, Target
} from 'lucide-react';
import type { IncomeSources, ClaimedDeductions } from '../utils/taxCalculator';

interface FinancialPlannerProps {
  income: IncomeSources;
  deductions: ClaimedDeductions;
}

export default function FinancialPlanner({ income, deductions }: FinancialPlannerProps) {
  // Financial parameters
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(45000);
  const [liquidSavings, setLiquidSavings] = useState<number>(250000);
  const termLifeCoverage = 10000000; // 1 Crore

  // Goal parameters
  const [goalType, setGoalType] = useState<'retirement' | 'home' | 'education'>('retirement');
  const [goalTarget, setGoalTarget] = useState<number>(20000000); // 2 Crore
  const [goalYears, setGoalYears] = useState<number>(25);

  // Computations
  const totalIncome = income.salary + income.businessIncome;
  const monthlyIncome = totalIncome / 12;

  // 1. Emergency Fund months coverage
  const emergencyCoverageMonths = monthlyExpenses > 0 ? (liquidSavings / monthlyExpenses) : 0;
  
  // 2. Savings Ratio
  // Estimate savings: Income - expenses - tax (let's assume simple ratio)
  const savingsRateVal = monthlyIncome > 0 ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100) : 0;

  // 3. Health Score Math
  const calculateHealthScore = () => {
    let score = 50; // base

    // Emergency fund (max 15 points)
    if (emergencyCoverageMonths >= 6) score += 15;
    else if (emergencyCoverageMonths >= 3) score += 10;
    else score += 3;

    // Savings rate (max 15 points)
    if (savingsRateVal >= 35) score += 15;
    else if (savingsRateVal >= 20) score += 10;
    else if (savingsRateVal >= 10) score += 5;

    // Insurance Adequacy (max 10 points)
    if (termLifeCoverage >= totalIncome * 10) score += 10;
    else if (termLifeCoverage > 0) score += 5;

    // Tax optimization claims (max 10 points)
    if (deductions.section80C >= 150000) score += 5;
    if (deductions.section80CCD_1B >= 50000) score += 5;

    return Math.min(100, score);
  };

  const healthScore = calculateHealthScore();

  // Goal savings calculations
  // Assume a 10% average annual return on investment
  const calculateGoalRequiredMonthly = () => {
    const P = goalTarget;
    const n = goalYears * 12;
    const r = 0.10 / 12; // 10% rate
    if (r === 0) return P / n;
    
    // Future value formula monthly savings: PMT = FV * r / ((1+r)^n - 1)
    const pmt = (P * r) / (Math.pow(1 + r, n) - 1);
    return Math.max(0, Math.round(pmt));
  };

  const requiredMonthlySavings = calculateGoalRequiredMonthly();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr', gap: '24px' }} className="grid-responsive-planner">
      
      {/* Left Column: Health Score Metrics */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <Award size={20} style={{ color: 'var(--accent-primary)' }} />
          Financial Health Rating
        </h3>

        {/* Score Ring / Callout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: `conic-gradient(var(--accent-success) ${healthScore}%, var(--bg-tertiary) ${healthScore}%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
          }}>
            <div style={{
              width: '66px', height: '66px', borderRadius: '50%',
              backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', fontWeight: 800
            }}>
              {healthScore}
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              {healthScore >= 80 ? 'Excellent Standing' : healthScore >= 60 ? 'Healthy Balance' : 'Needs Optimization'}
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Based on liquidity, savings, and insurance status.
            </span>
          </div>
        </div>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Monthly Expenses</span>
            <strong style={{ color: 'var(--text-primary)' }}>₹{monthlyExpenses.toLocaleString()}</strong>
          </div>
          <input 
            type="range" 
            min="10000" 
            max="300000" 
            step="5000" 
            value={monthlyExpenses} 
            onChange={(e) => setMonthlyExpenses(parseInt(e.target.value))}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Liquid Savings (FD + Bank)</span>
            <strong style={{ color: 'var(--text-primary)' }}>₹{liquidSavings.toLocaleString()}</strong>
          </div>
          <input 
            type="range" 
            min="10000" 
            max="2000000" 
            step="10000" 
            value={liquidSavings} 
            onChange={(e) => setLiquidSavings(parseInt(e.target.value))}
          />
        </div>

        {/* Health Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span>Emergency Fund Index:</span>
            <strong style={{ color: emergencyCoverageMonths >= 6 ? 'var(--accent-success)' : 'var(--accent-warning)' }}>
              {emergencyCoverageMonths.toFixed(1)} Months Expenses
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span>Savings Rate Ratio:</span>
            <strong style={{ color: savingsRateVal >= 30 ? 'var(--accent-success)' : 'var(--text-primary)' }}>
              {savingsRateVal}% of Income
            </strong>
          </div>
        </div>

      </div>

      {/* Right Column: Goal Planner */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <Target size={20} style={{ color: 'var(--accent-primary)' }} />
          AI Financial Goal Planner
        </h3>

        {/* Goal selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <button 
            className={`btn ${goalType === 'retirement' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '8px', fontSize: '0.8rem' }}
            onClick={() => { setGoalType('retirement'); setGoalTarget(20000000); setGoalYears(25); }}
          >
            Retirement
          </button>
          <button 
            className={`btn ${goalType === 'home' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '8px', fontSize: '0.8rem' }}
            onClick={() => { setGoalType('home'); setGoalTarget(7500000); setGoalYears(10); }}
          >
            Home Purchase
          </button>
          <button 
            className={`btn ${goalType === 'education' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '8px', fontSize: '0.8rem' }}
            onClick={() => { setGoalType('education'); setGoalTarget(5000000); setGoalYears(15); }}
          >
            Child Education
          </button>
        </div>

        {/* Target Amount */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Target Goal Amount (₹)</label>
          <input 
            type="number" 
            value={goalTarget} 
            onChange={(e) => setGoalTarget(parseInt(e.target.value) || 0)} 
          />
        </div>

        {/* Target Years */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Timeline (Years)</span>
            <strong style={{ color: 'var(--text-primary)' }}>{goalYears} Years</strong>
          </div>
          <input 
            type="range" 
            min="2" 
            max="40" 
            step="1" 
            value={goalYears} 
            onChange={(e) => setGoalYears(parseInt(e.target.value))}
          />
        </div>

        {/* Required Monthly Saving Result */}
        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>EST. MONTHLY SAVINGS NEEDED</span>
              <strong style={{ fontSize: '1.4rem', color: 'var(--accent-success)', fontWeight: 700 }}>
                ₹{requiredMonthlySavings.toLocaleString()}
              </strong>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Assuming 10% YoY returns
            </span>
          </div>

          {/* Tax-saving split recommendation */}
          <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '12px', paddingTop: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Recommended Tax-Saving Split Allocation:
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>ELSS Mutual Funds (80C Tax-saving equity)</span>
                <strong>₹{Math.round(requiredMonthlySavings * 0.4).toLocaleString()} (40%)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>NPS Tier-1 (Retirement specific deduction)</span>
                <strong>₹{Math.round(requiredMonthlySavings * 0.3).toLocaleString()} (30%)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>PPF / Debt (Guaranteed tax-free growth)</span>
                <strong>₹{Math.round(requiredMonthlySavings * 0.3).toLocaleString()} (30%)</strong>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
