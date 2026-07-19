import { 
  Calculator, Sparkles, CheckCircle
} from 'lucide-react';
import type { IncomeSources, ClaimedDeductions, CalculationResult } from '../utils/taxCalculator';

interface TaxOptimizerProps {
  income: IncomeSources;
  deductions: ClaimedDeductions;
  calcResult: CalculationResult;
  assessmentYear: string;
  onUpdateIncome: (income: Partial<IncomeSources>) => void;
  onUpdateDeductions: (deductions: Partial<ClaimedDeductions>) => void;
}

export default function TaxOptimizer({
  income,
  deductions,
  calcResult,
  assessmentYear,
  onUpdateIncome,
  onUpdateDeductions
}: TaxOptimizerProps) {
  
  const oldData = calcResult.oldRegime;
  const newData = calcResult.newRegime;
  const isNewOptimal = calcResult.optimalRegime === 'newRegime';

  // Dynamic recommendations based on current inputs
  const getAIRecommendations = () => {
    const recs = [];
    if (!isNewOptimal) {
      if (deductions.section80CCD_1B < 50000) {
        const potentialSavings = (50000 - deductions.section80CCD_1B) * 0.312; // approx 30% slab + cess
        recs.push({
          title: "Maximize NPS Contribution (Sec 80CCD(1B))",
          desc: `You've claimed ₹${deductions.section80CCD_1B.toLocaleString()} in NPS. Investing an additional ₹${(50000 - deductions.section80CCD_1B).toLocaleString()} could save you up to ₹${Math.round(potentialSavings).toLocaleString()} under the Old Regime.`,
          action: () => onUpdateDeductions({ section80CCD_1B: 50000 })
        });
      }
      if (deductions.section80C < 150000) {
        const potentialSavings = (150000 - deductions.section80C) * 0.312;
        recs.push({
          title: "Fill Section 80C Limit",
          desc: `Your 80C investments are ₹${deductions.section80C.toLocaleString()}. Increasing this to the ₹1,50,000 cap (via ELSS, PPF, or Term Insurance) will save you up to ₹${Math.round(potentialSavings).toLocaleString()} in taxes.`,
          action: () => onUpdateDeductions({ section80C: 150000 })
        });
      }
      if (income.allowanceHRA > 0 && income.rentPaid === 0) {
        recs.push({
          title: "Declare House Rent Paid",
          desc: "You have a salary HRA allowance of ₹" + income.allowanceHRA.toLocaleString() + " but haven't declared Rent Paid. Claiming rent paid would qualify you for HRA tax exemptions.",
          action: () => onUpdateIncome({ rentPaid: Math.round(income.salary * 0.15) })
        });
      }
    } else {
      recs.push({
        title: "Stay in New Regime & Invest Freely",
        desc: "The New Regime offers lower tax rates without requiring locked-in investments. You save ₹" + Math.round(calcResult.taxSavings).toLocaleString() + " automatically without tax-saving lock-ins.",
        action: null
      });
    }
    return recs;
  };

  const recommendations = getAIRecommendations();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }} className="grid-responsive-optimizer">
      
      {/* Left Column: Sliders & Controls */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <Calculator size={20} style={{ color: 'var(--accent-primary)' }} />
          Tax Inputs & Sliders
        </h3>

        {/* Salary Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Gross Annual Salary</span>
            <strong style={{ color: 'var(--text-primary)' }}>₹{income.salary.toLocaleString()}</strong>
          </div>
          <input 
            type="range" 
            min="200000" 
            max="4000000" 
            step="50000" 
            value={income.salary} 
            onChange={(e) => onUpdateIncome({ salary: parseInt(e.target.value) })}
          />
        </div>

        {/* HRA & Rent Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>HRA Exemption Parameters</span>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span>HRA Component in CTC</span>
              <span>₹{income.allowanceHRA.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1500000" 
              step="10000" 
              value={income.allowanceHRA} 
              onChange={(e) => onUpdateIncome({ allowanceHRA: parseInt(e.target.value) })}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span>Rent Paid (Annual)</span>
              <span>₹{income.rentPaid.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1200000" 
              step="10000" 
              value={income.rentPaid} 
              onChange={(e) => onUpdateIncome({ rentPaid: parseInt(e.target.value) })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', marginTop: '4px' }}>
            <span>Renting in Metro City?</span>
            <label className="switch-label">
              <input 
                type="checkbox" 
                checked={income.isMetro} 
                onChange={(e) => onUpdateIncome({ isMetro: e.target.checked })}
              />
              <span className="slider-switch"></span>
            </label>
          </div>
        </div>

        {/* Business Income Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Net Business/Profession Income</span>
            <strong style={{ color: 'var(--text-primary)' }}>₹{income.businessIncome.toLocaleString()}</strong>
          </div>
          <input 
            type="range" 
            min="0" 
            max="3000000" 
            step="20000" 
            value={income.businessIncome} 
            onChange={(e) => onUpdateIncome({ businessIncome: parseInt(e.target.value) })}
          />
        </div>

        {/* Section 80C Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Section 80C (PPF, ELSS, EPF)</span>
            <strong style={{ color: 'var(--text-primary)' }}>₹{deductions.section80C.toLocaleString()} / ₹1.5L</strong>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1500000" 
            step="5000" 
            value={deductions.section80C} 
            onChange={(e) => onUpdateDeductions({ section80C: Math.min(150000, parseInt(e.target.value)) })}
          />
        </div>

        {/* NPS Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>NPS Extra (Sec 80CCD(1B))</span>
            <strong style={{ color: 'var(--text-primary)' }}>₹{deductions.section80CCD_1B.toLocaleString()} / ₹50k</strong>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100000" 
            step="5000" 
            value={deductions.section80CCD_1B} 
            onChange={(e) => onUpdateDeductions({ section80CCD_1B: Math.min(50000, parseInt(e.target.value)) })}
          />
        </div>

        {/* Section 80D Sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Section 80D (Health Insurance)</span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span>Self & Family Premium</span>
              <span>₹{deductions.section80D_self.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="50000" 
              step="1000" 
              value={deductions.section80D_self} 
              onChange={(e) => onUpdateDeductions({ section80D_self: parseInt(e.target.value) })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
            <span>Are you a Senior Citizen?</span>
            <label className="switch-label">
              <input 
                type="checkbox" 
                checked={deductions.isSelfSenior} 
                onChange={(e) => onUpdateDeductions({ isSelfSenior: e.target.checked })}
              />
              <span className="slider-switch"></span>
            </label>
          </div>
        </div>

      </div>

      {/* Right Column: Comparative Sheets & Recommendations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Recommendation Header */}
        <div className="glass-panel glass-panel-glow-success" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%), var(--bg-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
              <Sparkles size={24} style={{ color: 'var(--accent-success)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>AI Regime Evaluation</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Comparing calculations versioned for <strong>{assessmentYear}</strong>
              </p>
            </div>
          </div>

          <div style={{ marginTop: '20px', borderLeft: '3px solid var(--accent-success)', paddingLeft: '16px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>
              Recommended: {isNewOptimal ? 'New Tax Regime' : 'Old Tax Regime'}
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>
              Your net tax under the {isNewOptimal ? 'New' : 'Old'} Regime is ₹{Math.round(calcResult[calcResult.optimalRegime].totalTax).toLocaleString()}, saving you <strong>₹{Math.round(calcResult.taxSavings).toLocaleString()}</strong> compared to the alternative.
            </p>
          </div>
        </div>

        {/* AI Actionable Recommendations */}
        {recommendations.length > 0 && recommendations[0].action && (
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '12px' }}>
              Actionable Tax Saving Opportunities
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recommendations.map((rec, i) => (
                <div key={i} style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={14} />
                      {rec.title}
                    </h5>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                      {rec.desc}
                    </p>
                  </div>
                  {rec.action && (
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '6px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                      onClick={rec.action}
                    >
                      Apply Optimization
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Side-by-Side Detailed Breakdown Table */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Detailed Computation Breakdown</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 8px' }}>Calculation Step</th>
                  <th style={{ padding: '12px 8px' }}>Old Regime</th>
                  <th style={{ padding: '12px 8px' }}>New Regime</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Gross Income</td>
                  <td style={{ padding: '12px 8px', fontWeight: 600 }}>₹{oldData.grossIncome.toLocaleString()}</td>
                  <td style={{ padding: '12px 8px', fontWeight: 600 }}>₹{newData.grossIncome.toLocaleString()}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>HRA Exemption</td>
                  <td style={{ padding: '12px 8px', color: 'var(--accent-success)' }}>- ₹{oldData.hraExemption.toLocaleString()}</td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Not Allowed</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Standard Deduction</td>
                  <td style={{ padding: '12px 8px', color: 'var(--accent-success)' }}>- ₹{oldData.standardDeduction.toLocaleString()}</td>
                  <td style={{ padding: '12px 8px', color: 'var(--accent-success)' }}>- ₹{newData.standardDeduction.toLocaleString()}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Section Deductions (80C, 80D, etc)</td>
                  <td style={{ padding: '12px 8px', color: 'var(--accent-success)' }}>
                    - ₹{(oldData.totalDeductions - oldData.standardDeduction - oldData.hraExemption).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Not Allowed</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(99, 102, 241, 0.03)' }}>
                  <td style={{ padding: '12px 8px', color: 'var(--text-primary)', fontWeight: 600 }}>Net Taxable Income</td>
                  <td style={{ padding: '12px 8px', fontWeight: 700 }}>₹{oldData.taxableIncome.toLocaleString()}</td>
                  <td style={{ padding: '12px 8px', fontWeight: 700 }}>₹{newData.taxableIncome.toLocaleString()}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Base Slab Tax</td>
                  <td style={{ padding: '12px 8px' }}>₹{Math.round(oldData.baseTax).toLocaleString()}</td>
                  <td style={{ padding: '12px 8px' }}>₹{Math.round(newData.baseTax).toLocaleString()}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Section 87A Rebate</td>
                  <td style={{ padding: '12px 8px', color: 'var(--accent-success)' }}>- ₹{oldData.rebate87A.toLocaleString()}</td>
                  <td style={{ padding: '12px 8px', color: 'var(--accent-success)' }}>- ₹{newData.rebate87A.toLocaleString()}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Surcharges</td>
                  <td style={{ padding: '12px 8px' }}>₹{Math.round(oldData.surcharge).toLocaleString()}</td>
                  <td style={{ padding: '12px 8px' }}>₹{Math.round(newData.surcharge).toLocaleString()}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Health & Education Cess (4%)</td>
                  <td style={{ padding: '12px 8px' }}>₹{Math.round(oldData.cess).toLocaleString()}</td>
                  <td style={{ padding: '12px 8px' }}>₹{Math.round(newData.cess).toLocaleString()}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)', fontSize: '1.05rem', fontWeight: 700 }}>
                  <td style={{ padding: '16px 8px' }}>Total Tax Liability</td>
                  <td style={{ padding: '16px 8px', color: !isNewOptimal ? 'var(--accent-success)' : 'var(--text-primary)' }}>
                    ₹{Math.round(oldData.totalTax).toLocaleString()}
                    {!isNewOptimal && <CheckCircle size={14} style={{ display: 'inline', marginLeft: '6px', color: 'var(--accent-success)' }} />}
                  </td>
                  <td style={{ padding: '16px 8px', color: isNewOptimal ? 'var(--accent-success)' : 'var(--text-primary)' }}>
                    ₹{Math.round(newData.totalTax).toLocaleString()}
                    {isNewOptimal && <CheckCircle size={14} style={{ display: 'inline', marginLeft: '6px', color: 'var(--accent-success)' }} />}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
