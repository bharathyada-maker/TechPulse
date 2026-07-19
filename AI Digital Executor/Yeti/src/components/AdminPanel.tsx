import { useState } from 'react';
import { 
  Settings, ShieldCheck, Database, Save, RotateCcw, ToggleLeft, ToggleRight
} from 'lucide-react';
import taxRulesData from '../config/tax-rules.json';

interface AdminPanelProps {
  assessmentYear: string;
  customRules: any;
  onUpdateRules: (newRules: any) => void;
  onResetRules: () => void;
}

export default function AdminPanel({
  assessmentYear,
  customRules,
  onUpdateRules,
  onResetRules
}: AdminPanelProps) {
  
  const rules = customRules || taxRulesData;
  const currentAYRules = rules.assessmentYears[assessmentYear] || rules.assessmentYears['AY-2025-26'];

  const [stdDedNew, setStdDedNew] = useState<number>(currentAYRules.standardDeductionSalaried.newRegime);
  const [stdDedOld, setStdDedOld] = useState<number>(currentAYRules.standardDeductionSalaried.oldRegime);
  const [limit80C, setLimit80C] = useState<number>(currentAYRules.deductionsCatalog.section80C.limit);
  const [cessRate, setCessRate] = useState<number>(currentAYRules.cessRate * 100); // format as %

  // Feature Flags
  const [flags, setFlags] = useState({
    cryptoTax: true,
    digilocker: true,
    ocrScanner: true,
    voiceAssistant: false,
    bulkFiling: true
  });

  const handleSaveRules = () => {
    // Create copy of rules object
    const updated = JSON.parse(JSON.stringify(rules));
    
    // Update specific parameters
    const ayObj = updated.assessmentYears[assessmentYear];
    if (ayObj) {
      ayObj.standardDeductionSalaried.newRegime = stdDedNew;
      ayObj.standardDeductionSalaried.oldRegime = stdDedOld;
      ayObj.deductionsCatalog.section80C.limit = limit80C;
      ayObj.cessRate = cessRate / 100;
    }
    
    onUpdateRules(updated);
    alert('Tax rules updated successfully in workspace configuration engine!');
  };

  const handleReset = () => {
    onResetRules();
    // Reload state values from clean rules
    const cleanAY = taxRulesData.assessmentYears[assessmentYear as 'AY-2025-26'] || taxRulesData.assessmentYears['AY-2025-26'];
    setStdDedNew(cleanAY.standardDeductionSalaried.newRegime);
    setStdDedOld(cleanAY.standardDeductionSalaried.oldRegime);
    setLimit80C(cleanAY.deductionsCatalog.section80C.limit);
    setCessRate(cleanAY.cessRate * 100);
    alert('Tax rules reset to default legislative code.');
  };

  // Mock Audit logs
  const auditLogs = [
    { id: '1', timestamp: '2026-06-26 08:15:22', action: 'ITR-1 Calculated', details: 'Salary: ₹12,00,000, Tax: ₹82,500', outcome: 'Success' },
    { id: '2', timestamp: '2026-06-26 08:02:11', action: 'Rule Engine Reload', details: 'Loaded config schema v1.4', outcome: 'Completed' },
    { id: '3', timestamp: '2026-06-25 17:45:00', action: 'GST Invoice Created', details: 'Inv-9281, Client: Acme Corp, IGST: ₹13,500', outcome: 'Success' },
    { id: '4', timestamp: '2026-06-25 15:30:12', action: 'Aadhaar OTP Request', details: 'Sent EVC to +9198******10', outcome: 'Dispatched' }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr', gap: '24px' }} className="grid-responsive-admin">
      
      {/* Left Column: Live Configurator */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <Settings size={20} style={{ color: 'var(--accent-primary)' }} />
          Tax Rule Configurator ({assessmentYear})
        </h3>

        <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <ShieldCheck size={16} style={{ display: 'inline', marginRight: '6px', color: 'var(--accent-primary)' }} />
          Modifying rules here updates all calculations for this AY instantly. Slabs and deductions are data-driven.
        </div>

        {/* Standard Deductions Editor */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-responsive-fields">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Standard Ded. (New Regime)</label>
            <input 
              type="number" 
              value={stdDedNew} 
              onChange={(e) => setStdDedNew(parseInt(e.target.value) || 0)} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Standard Ded. (Old Regime)</label>
            <input 
              type="number" 
              value={stdDedOld} 
              onChange={(e) => setStdDedOld(parseInt(e.target.value) || 0)} 
            />
          </div>
        </div>

        {/* Deductions Cap Editor */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-responsive-fields">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Section 80C Limit (Old Regime)</label>
            <input 
              type="number" 
              value={limit80C} 
              onChange={(e) => setLimit80C(parseInt(e.target.value) || 0)} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Health & Education Cess (%)</label>
            <input 
              type="number" 
              step="0.5" 
              value={cessRate} 
              onChange={(e) => setCessRate(parseFloat(e.target.value) || 0)} 
            />
          </div>
        </div>

        {/* Action Panel */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSaveRules}>
            <Save size={16} /> Save Rule Configuration
          </button>
          <button className="btn btn-outline" style={{ color: 'var(--accent-danger)' }} onClick={handleReset}>
            <RotateCcw size={16} /> Reset defaults
          </button>
        </div>

      </div>

      {/* Right Column: Feature Flags & System Audit Logs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Feature Flags */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>System Feature Toggles</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.85rem', display: 'block' }}>Crypto Taxation (Sec 115BBH)</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Enables 30% flat tax rules on virtual digital assets</span>
              </div>
              <button 
                onClick={() => setFlags(f => ({ ...f, cryptoTax: !f.cryptoTax }))} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: flags.cryptoTax ? 'var(--accent-primary)' : 'var(--text-muted)' }}
              >
                {flags.cryptoTax ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.85rem', display: 'block' }}>AI OCR Scanner Engine</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Enables scanning of PDF receipts and forms</span>
              </div>
              <button 
                onClick={() => setFlags(f => ({ ...f, ocrScanner: !f.ocrScanner }))} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: flags.ocrScanner ? 'var(--accent-primary)' : 'var(--text-muted)' }}
              >
                {flags.ocrScanner ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.85rem', display: 'block' }}>DigiLocker Verification</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Fetches Aadhaar/PAN certificates automatically</span>
              </div>
              <button 
                onClick={() => setFlags(f => ({ ...f, digilocker: !f.digilocker }))} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: flags.digilocker ? 'var(--accent-primary)' : 'var(--text-muted)' }}
              >
                {flags.digilocker ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.85rem', display: 'block' }}>Natural Language Voice Assistant</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Enables speech-to-text queries in AI chat</span>
              </div>
              <button 
                onClick={() => setFlags(f => ({ ...f, voiceAssistant: !f.voiceAssistant }))} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: flags.voiceAssistant ? 'var(--accent-primary)' : 'var(--text-muted)' }}
              >
                {flags.voiceAssistant ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
              </button>
            </div>

          </div>
        </div>

        {/* Audit Logs */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} style={{ color: 'var(--accent-primary)' }} />
            System Audit Trail
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto' }}>
            {auditLogs.map(log => (
              <div key={log.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{log.action}</strong>
                  <span style={{ color: 'var(--text-muted)' }}>{log.timestamp}</span>
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>{log.details}</div>
                <span style={{ 
                  color: log.outcome === 'Success' || log.outcome === 'Completed' ? 'var(--accent-success)' : 'var(--accent-primary)',
                  fontWeight: 600, fontSize: '0.65rem', marginTop: '2px'
                }}>
                  Outcome: {log.outcome}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
