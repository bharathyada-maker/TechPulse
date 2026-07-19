import { useState } from 'react';
import { 
  TrendingUp, ArrowUpRight, AlertTriangle, CheckCircle, 
  Calendar, ArrowRight, Import, FileText, UserCheck
} from 'lucide-react';
import type { IncomeSources, ClaimedDeductions, CalculationResult } from '../utils/taxCalculator';

interface DashboardProps {
  income: IncomeSources;
  deductions: ClaimedDeductions;
  calcResult: CalculationResult;
  assessmentYear: string;
  activeRole: string;
  onImportMockData: (mockIncome: IncomeSources, mockDeductions: ClaimedDeductions) => void;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ 
  income, 
  deductions, 
  calcResult, 
  assessmentYear,
  activeRole: _activeRole,
  onImportMockData,
  onNavigate
}: DashboardProps) {
  const [showAISDrawer, setShowAISDrawer] = useState(false);
  const [refundStatus, setRefundStatus] = useState<'pending' | 'processed' | 'delayed'>('pending');

  const optimalRegimeData = calcResult[calcResult.optimalRegime];
  const oldRegimeData = calcResult.oldRegime;
  const newRegimeData = calcResult.newRegime;

  // Mock AIS / TIS Data available for import
  const mockAISData = {
    income: {
      salary: 1500000,
      allowanceHRA: 180000,
      basicSalary: 600000,
      rentPaid: 240000,
      isMetro: true,
      businessIncome: 0,
      businessExpenses: 0,
      capitalGainsShort: 45000,
      capitalGainsLong: 75000,
      otherInterest: 18500,
      otherDividend: 12000,
      cryptoIncome: 0,
      foreignIncome: 0
    },
    deductions: {
      section80C: 150000,
      section80D_self: 25000,
      isSelfSenior: false,
      section80D_parents: 35000,
      areParentsSenior: true,
      section80CCD_1B: 50000,
      section80TTA: 10000,
      section24B_homeLoan: 120000,
      otherDeductions: 0
    }
  };

  const handleImport = () => {
    onImportMockData(mockAISData.income, mockAISData.deductions);
    setShowAISDrawer(false);
  };

  // SVG Chart math helper
  const maxTaxVal = Math.max(oldRegimeData.totalTax, newRegimeData.totalTax, 50000);
  const oldBarHeight = (oldRegimeData.totalTax / maxTaxVal) * 150;
  const newBarHeight = (newRegimeData.totalTax / maxTaxVal) * 150;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Alert Banner / Notification */}
      {income.salary === 0 && (
        <div className="alert-box alert-info" style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <AlertTriangle size={20} />
            <div>
              <strong>Quick Start: No financial data detected.</strong> Import your mock AIS / TIS profile (Form 16, interest, capital gains) to simulate compliance reporting.
            </div>
          </div>
          <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => setShowAISDrawer(true)}>
            <Import size={14} /> View AIS Summary
          </button>
        </div>
      )}

      {/* Hero Analytics Row */}
      <div className="dashboard-grid">
        {/* Gross Income Card */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>
              <span>GROSS ANNUAL INCOME</span>
              <TrendingUp size={16} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '4px 0' }}>
              ₹{optimalRegimeData.grossIncome.toLocaleString()}
            </h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Salary, capital gains, interest & business
            </div>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: 'var(--accent-success)', display: 'inline-flex', alignItems: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
              <ArrowUpRight size={14} /> Simulated AIS import ready
            </span>
          </div>
        </div>

        {/* Taxes Paid Card */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>
              <span>PROJECTED TAX LIABILITY</span>
              <FileText size={16} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '4px 0' }}>
              ₹{Math.round(optimalRegimeData.totalTax).toLocaleString()}
            </h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Calculated using the optimal regime
            </div>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '4px', alignItems: 'center', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
              {calcResult.optimalRegime === 'newRegime' ? 'New Tax Regime' : 'Old Tax Regime'}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>is cheaper</span>
          </div>
        </div>

        {/* Refund Tracker Card */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>
              <span>REFUND ESTIMATE (AY 2025-26)</span>
              <CheckCircle size={16} style={{ color: 'var(--accent-success)' }} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '4px 0', color: 'var(--accent-success)' }}>
              ₹{optimalRegimeData.grossIncome > 0 ? '42,500' : '0'}
            </h2>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '6px' }}>
              <span className={`pulse-green`} style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-success)', display: 'inline-block' }}></span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {refundStatus === 'pending' ? 'Processing at CPC' : refundStatus === 'delayed' ? 'Delayed - Mismatch review' : 'Credited to Bank Account'}
              </span>
            </div>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span style={{ color: 'var(--accent-primary)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setRefundStatus(prev => prev === 'pending' ? 'delayed' : prev === 'delayed' ? 'processed' : 'pending')}>
              Toggle Status Simulation
            </span>
          </div>
        </div>

        {/* Compliance Score Card */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>
              <span>COMPLIANCE SCORE</span>
              <UserCheck size={16} style={{ color: 'var(--accent-warning)' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '4px 0', color: 'var(--accent-success)' }}>
                92<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/100</span>
              </h2>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              All returns filed, 1 warning detected
            </div>
          </div>
          <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Financial health: Excellent</span>
            <span style={{ color: 'var(--accent-primary)', cursor: 'pointer' }} onClick={() => onNavigate('financial-planner')}>Details</span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px', flexWrap: 'wrap' }} className="grid-responsive-dashboard">
        
        {/* Left Column: Visual Analytics & Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Regime Optimization comparison chart */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Regime Comparison & Tax Savings</span>
              <span style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)' }}>
                You save ₹{Math.round(calcResult.taxSavings).toLocaleString()}
              </span>
            </h3>

            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', height: '220px', justifyContent: 'space-around', margin: '20px 0' }}>
              {/* Old Regime bar */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>₹{Math.round(oldRegimeData.totalTax).toLocaleString()}</div>
                <div style={{
                  width: '60px',
                  height: `${oldBarHeight}px`,
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '6px 6px 0 0',
                  border: '1px solid var(--border-color)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'height 0.3s ease'
                }}>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, top: 0, background: 'linear-gradient(to top, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.5))' }}></div>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Old Regime</div>
              </div>

              {/* New Regime bar */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>₹{Math.round(newRegimeData.totalTax).toLocaleString()}</div>
                <div style={{
                  width: '60px',
                  height: `${newBarHeight}px`,
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '6px 6px 0 0',
                  border: '1px solid var(--border-color)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'height 0.3s ease'
                }}>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, top: 0, background: 'linear-gradient(to top, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.5))' }}></div>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>New Regime</div>
              </div>

              {/* Savings callout */}
              <div style={{ maxWidth: '240px', padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Optimal Decision</div>
                <h4 style={{ color: 'var(--accent-success)', fontSize: '1.1rem', margin: '6px 0' }}>
                  {calcResult.optimalRegime === 'newRegime' ? 'New Tax Regime' : 'Old Tax Regime'}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Based on your income of ₹{optimalRegimeData.grossIncome.toLocaleString()} and deductions, the {calcResult.optimalRegime === 'newRegime' ? 'New' : 'Old'} Regime is optimal, reducing your taxes by ₹{Math.round(calcResult.taxSavings).toLocaleString()}.
                </p>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '6px 12px', fontSize: '0.8rem', marginTop: '12px' }}
                  onClick={() => onNavigate('optimizer')}
                >
                  Regime Optimizer <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* AI Tax Recommendation Feed */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>AI Compliance & Optimization Insights</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.1)', height: 'fit-content' }}>
                  <TrendingUp size={18} style={{ color: 'var(--accent-primary)' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Maximize Section 80CCD(1B) Benefits</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                    You have claimed ₹{deductions.section80CCD_1B.toLocaleString()} in National Pension System (NPS). Under the Old Regime, you can invest an additional ₹{(50000 - deductions.section80CCD_1B).toLocaleString()} to claim the full ₹50,000 deduction, saving up to ₹15,600.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', height: 'fit-content' }}>
                  <AlertTriangle size={18} style={{ color: 'var(--accent-warning)' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>GST Notice: GSTR-2B Input credit mismatch</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                    Our rule engine flagged a discrepancy of ₹12,400 between your sales log and supplier-uploaded GSTR-1 returns. Review this in the GST portal to prevent penalty alerts.
                  </p>
                  <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem', marginTop: '8px' }} onClick={() => onNavigate('gst')}>
                    View GST Log
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Compliance Calendar & Quick Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Quick Filing Actions */}
          <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%), var(--bg-card)' }}>
            <h3 style={{ marginBottom: '12px' }}>Filing Actions</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.4' }}>
              Generate your return calculations, verify with AIS, and file directly via client helper.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => onNavigate('itr')}>
                <FileText size={16} /> File ITR Now ({assessmentYear})
              </button>
              <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setShowAISDrawer(true)}>
                <Import size={16} /> Load from AIS/TIS Summary
              </button>
            </div>
          </div>

          {/* Compliance Calendar */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} style={{ color: 'var(--accent-primary)' }} />
              Compliance Calendar
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>GST GSTR-1 Monthly Return</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due Date: July 11, 2026</div>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', fontWeight: 600, marginLeft: 'auto' }}>
                  15 Days
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>ITR Filing (Individuals)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due Date: July 31, 2026</div>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', fontWeight: 600, marginLeft: 'auto' }}>
                  Upcoming
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>GST GSTR-3B Filing</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due Date: July 20, 2026</div>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                  24 Days
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Advance Tax - 2nd Installment</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due Date: September 15, 2026</div>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                  Regular
                </span>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* AIS / TIS Slide-over Drawer simulation */}
      {showAISDrawer && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '450px',
          maxWidth: '100%',
          backgroundColor: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-color)',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.6)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {/* Drawer Header */}
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} style={{ color: 'var(--accent-primary)' }} />
              AIS & TIS Summary (AY 2025-26)
            </h3>
            <button 
              className="btn btn-outline" 
              style={{ padding: '4px 8px', fontSize: '0.8rem' }}
              onClick={() => setShowAISDrawer(false)}
            >
              Close
            </button>
          </div>

          {/* Drawer Content */}
          <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="alert-box alert-info">
              <Import size={16} />
              <span>This panel fetches data reported by employers, banks, and brokers directly to the Income Tax Department. You can auto-fill your filing worksheets by clicking the import button below.</span>
            </div>

            {/* Custom JSON Profile Upload */}
            <div style={{ padding: '16px', borderRadius: '12px', border: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: 'var(--bg-tertiary)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Upload Custom Client Profile (.json)</span>
              <input 
                type="file" 
                accept=".json" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      const data = JSON.parse(event.target?.result as string);
                      if (data.income && data.deductions) {
                        onImportMockData(data.income, data.deductions);
                        setShowAISDrawer(false);
                        alert(`Real data profile "${file.name}" imported successfully!`);
                      } else {
                        alert('Invalid file format. Must contain "income" and "deductions" keys.');
                      }
                    } catch (err) {
                      alert('Error parsing JSON file.');
                    }
                  };
                  reader.readAsText(file);
                }}
                style={{ fontSize: '0.75rem', width: '100%', color: 'var(--text-secondary)' }}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Upload a standard TaxWise JSON profile to run tax simulations with your own numbers.
              </span>
            </div>

            {/* Income sections */}
            <div>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                Part A: Reported Income
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Salary (from Tech Corp)</span>
                  <strong style={{ color: 'var(--text-primary)' }}>₹{mockAISData.income.salary.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>HRA Allowance Component</span>
                  <strong>₹{mockAISData.income.allowanceHRA.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Long Term Capital Gains (Mutual Funds)</span>
                  <strong>₹{mockAISData.income.capitalGainsLong.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Short Term Capital Gains (Stocks)</span>
                  <strong>₹{mockAISData.income.capitalGainsShort.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Savings Bank Interest</span>
                  <strong>₹{mockAISData.income.otherInterest.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Dividends Received</span>
                  <strong>₹{mockAISData.income.otherDividend.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* Deductions sections */}
            <div>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                Part B: Deductions & Taxes Paid
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>EPF & Life Insurance (80C)</span>
                  <strong>₹{mockAISData.deductions.section80C.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Health Insurance (80D Self)</span>
                  <strong>₹{mockAISData.deductions.section80D_self.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Parents Health Premium (80D Senior)</span>
                  <strong>₹{mockAISData.deductions.section80D_parents.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Home Loan Interest (Sec 24b)</span>
                  <strong>₹{mockAISData.deductions.section24B_homeLoan.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>TDS Deducted (Employer)</span>
                  <strong style={{ color: 'var(--accent-success)' }}>₹1,65,400</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
            <button className="btn btn-success" style={{ flex: 1 }} onClick={handleImport}>
              <Import size={16} /> Import Data into TaxWise
            </button>
            <button className="btn btn-outline" onClick={() => setShowAISDrawer(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Style for slide-in animation */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
