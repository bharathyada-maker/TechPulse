import { useState } from 'react';
import { 
  Briefcase, AlertTriangle, RefreshCw, Plus, 
  ArrowDownRight, ArrowUpRight
} from 'lucide-react';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  isDuplicate?: boolean;
}

export default function Bookkeeping() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [isClassifying, setIsClassifying] = useState(false);
  const [txns, setTxns] = useState<Transaction[]>([
    { id: '1', description: 'Client Consulting Retainer', amount: 150000, type: 'income', category: 'Revenue', date: '2026-06-25' },
    { id: '2', description: 'AWS Infrastructure Billing', amount: 18500, type: 'expense', category: 'Cloud Infrastructure', date: '2026-06-24' },
    { id: '3', description: 'Office Coworking Rent', amount: 25000, type: 'expense', category: 'Rent & Space', date: '2026-06-20' },
    { id: '4', description: 'Internet Fiber Bill', amount: 1500, type: 'expense', category: 'Utilities', date: '2026-06-18' }
  ]);

  // AI Auto-Categorize rules
  const classifyAI = (desc: string): string => {
    const d = desc.toLowerCase();
    if (d.includes('aws') || d.includes('server') || d.includes('cloud') || d.includes('hosting')) return 'Cloud Infrastructure';
    if (d.includes('consulting') || d.includes('client') || d.includes('payment') || d.includes('sales')) return 'Revenue';
    if (d.includes('office') || d.includes('cowork') || d.includes('rent')) return 'Rent & Space';
    if (d.includes('internet') || d.includes('fiber') || d.includes('phone')) return 'Utilities';
    if (d.includes('software') || d.includes('saas') || d.includes('github') || d.includes('figma')) return 'Software Subscriptions';
    if (d.includes('travel') || d.includes('uber') || d.includes('cab') || d.includes('flight')) return 'Travel Expenses';
    return 'General Operations';
  };

  // Add transaction
  const handleAddTxn = () => {
    if (!description || !amount) return;
    const amt = parseFloat(amount);
    
    setIsClassifying(true);

    setTimeout(() => {
      // Check for duplicate
      const duplicateFound = txns.some(t => 
        t.description.toLowerCase() === description.toLowerCase() && 
        t.amount === amt &&
        t.type === type
      );

      const newTx: Transaction = {
        id: Date.now().toString(),
        description,
        amount: amt,
        type,
        category: classifyAI(description),
        date: new Date().toISOString().split('T')[0],
        isDuplicate: duplicateFound
      };

      setTxns(prev => [newTx, ...prev]);
      setDescription('');
      setAmount('');
      setIsClassifying(false);
    }, 1000);
  };

  // Computations
  const totalRevenue = txns.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = txns.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netOperatingProfit = totalRevenue - totalExpenses;
  const projectedTax = netOperatingProfit > 0 ? netOperatingProfit * 0.25 : 0; // simulated corporate / business tax slab

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr', gap: '24px' }} className="grid-responsive-bookkeeping">
      
      {/* Left Column: Transaction input and ledger */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <Briefcase size={20} style={{ color: 'var(--accent-primary)' }} />
          AI Bookkeeper & Smart Ledger
        </h3>

        {/* Add Transaction Input Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr auto', gap: '12px', alignItems: 'center' }} className="grid-responsive-fields">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Description</label>
            <input 
              type="text" 
              placeholder="e.g. AWS Subscription, Client Payment" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Amount (₹)</label>
            <input 
              type="number" 
              placeholder="0.00" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Type</label>
            <select value={type} onChange={(e: any) => setType(e.target.value)}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ height: '42px', marginTop: '18px' }}
            onClick={handleAddTxn}
            disabled={isClassifying}
          >
            {isClassifying ? <RefreshCw className="spin-animation" size={16} /> : <Plus size={16} />}
          </button>
        </div>

        {/* Duplicate warning alert */}
        {txns.some(t => t.isDuplicate) && (
          <div className="alert-box alert-warning">
            <AlertTriangle size={18} />
            <span>
              <strong>AI Warning: Duplicate transaction detected.</strong> An expense/income item with matching amount and description exists. Check details below to avoid duplicate deductions.
            </span>
          </div>
        )}

        {/* Ledger Transaction History List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Ledger transactions</span>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
            {txns.map(t => (
              <div 
                key={t.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '12px 16px', 
                  borderRadius: '10px', 
                  backgroundColor: 'var(--bg-secondary)', 
                  border: t.isDuplicate ? '1px solid var(--accent-warning)' : '1px solid var(--border-color)',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ 
                    padding: '8px', 
                    borderRadius: '8px', 
                    backgroundColor: t.type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                    color: t.type === 'income' ? 'var(--accent-success)' : 'var(--accent-danger)' 
                  }}>
                    {t.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.85rem' }}>{t.description}</strong>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.date}</span>
                      <span style={{ fontSize: '0.7rem', padding: '1px 5px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                        {t.category}
                      </span>
                      {t.isDuplicate && (
                        <span style={{ fontSize: '0.7rem', padding: '1px 5px', borderRadius: '4px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-warning)', fontWeight: 600 }}>
                          Duplicate Mapped
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <strong style={{ fontSize: '0.9rem', color: t.type === 'income' ? 'var(--accent-success)' : 'var(--text-primary)', marginLeft: 'auto' }}>
                  {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                </strong>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Column: Financial Health & Tax Forecast */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* P&L Statement */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Profit & Loss Statement (YTD)</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Revenue (Sales / Receipts)</span>
              <strong>₹{totalRevenue.toLocaleString()}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Operating Expenses</span>
              <strong style={{ color: 'var(--accent-danger)' }}>- ₹{totalExpenses.toLocaleString()}</strong>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 700 }}>
              <span>Operating Income (EBITDA)</span>
              <span style={{ color: netOperatingProfit > 0 ? 'var(--accent-success)' : 'var(--text-primary)' }}>
                ₹{netOperatingProfit.toLocaleString()}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Projected Corporate / Business Tax (25%)</span>
              <span>₹{Math.round(projectedTax).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Balance Sheet Summary */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Balance Sheet (Simulated)</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
              <strong>ASSETS</strong>
              <strong>₹{(netOperatingProfit + 500000).toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '8px' }}>
              <span>Bank Balance (Live API)</span>
              <span>₹{Math.max(0, netOperatingProfit + 450000).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '8px' }}>
              <span>Accounts Receivable (Outstanding Invoices)</span>
              <span>₹50,000</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginTop: '8px' }}>
              <strong>LIABILITIES & EQUITY</strong>
              <strong>₹{(netOperatingProfit + 500000).toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '8px' }}>
              <span>Accounts Payable (Vendors)</span>
              <span>₹12,400</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '8px' }}>
              <span>Owner Equity / Retained Earnings</span>
              <span>₹{(netOperatingProfit + 487600).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Cash Flow Projections */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>3-Month Cash Flow Forecast</h3>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', height: '140px', justifyContent: 'space-around', margin: '10px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>₹{(netOperatingProfit).toLocaleString()}</div>
              <div style={{ width: '100%', height: '50px', backgroundColor: 'var(--accent-primary)', borderRadius: '4px 4px 0 0', opacity: 0.6 }}></div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>July</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>₹{(netOperatingProfit + 45000).toLocaleString()}</div>
              <div style={{ width: '100%', height: '65px', backgroundColor: 'var(--accent-primary)', borderRadius: '4px 4px 0 0', opacity: 0.8 }}></div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>August</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>₹{(netOperatingProfit + 110000).toLocaleString()}</div>
              <div style={{ width: '100%', height: '90px', backgroundColor: 'var(--accent-success)', borderRadius: '4px 4px 0 0' }}></div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>September</div>
            </div>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textAlign: 'center', marginTop: '8px' }}>
            Forecast based on recurring invoices and expense averages
          </span>
        </div>

      </div>

      <style>{`
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
}
