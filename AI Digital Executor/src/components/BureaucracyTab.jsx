import React, { useState } from 'react';
import { FileCheck2, Calendar, ClipboardCheck, Sparkles, AlertCircle, FileText, ChevronRight } from 'lucide-react';

export default function BureaucracyTab() {
  const [selectedFile, setSelectedFile] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hoveredStrategy, setHoveredStrategy] = useState(null);

  const mockDocs = [
    { name: 'tax_form_1040_2025.txt', relPath: 'Documents/Taxes/tax_form_1040_2025.txt', desc: 'US Individual Income Tax Form (Form 1040)' },
    { name: 'invoice_draft_june.pdf', relPath: 'Downloads/invoice_draft_june.pdf', desc: 'Utility Bill Statement from Water Corp' }
  ];

  const handleAnalyze = async (relPath) => {
    setLoading(true);
    setResult(null);
    setSelectedFile(relPath);

    try {
      const response = await fetch('http://localhost:3001/api/bureaucracy/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: relPath })
      });
      const data = await response.json();
      if (data.success) {
        setResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileCheck2 size={24} style={{ color: '#ec4899' }} />
          Bureaucracy Assistant
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
          Translate institutional jargon, outline deadlines, and auto-complete required files.
        </p>
      </div>

      {/* Selector of files */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Select Sandbox Document to Parse</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {mockDocs.map((doc, idx) => (
            <div 
              key={idx}
              onClick={() => handleAnalyze(doc.relPath)}
              onMouseEnter={() => setHoveredStrategy({ title: `Parse ${doc.name}`, approach: 'Executes document regex parsing. Identifies form categories, extracts outstanding balances/due dates, and queries profile database schemas to prefill inputs.', impact: 'Translates jargon into clean actionable timeline goals and auto-completes fields.' })}
              onMouseLeave={() => setHoveredStrategy(null)}
              className="glass-card-interactive"
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '6px',
                borderColor: selectedFile === doc.relPath ? 'var(--accent-cyan)' : 'var(--border-dim)',
                background: selectedFile === doc.relPath ? 'rgba(0, 240, 255, 0.02)' : 'rgba(255, 255, 255, 0.015)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#00f0ff', fontSize: '13px' }}>
                <FileText size={14} />
                {doc.name}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{doc.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategy Detail Popover */}
      {hoveredStrategy && (
        <div className="glass-panel animate-slide-up" style={{
          padding: '16px',
          border: '1px solid rgba(236, 72, 153, 0.25)',
          background: 'rgba(236, 72, 153, 0.02)',
          borderRadius: '10px',
          fontSize: '13px',
          color: '#e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          boxShadow: '0 4px 20px rgba(236, 72, 153, 0.04)'
        }}>
          <div style={{ fontWeight: '700', color: '#ec4899', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} />
            Action Strategy: {hoveredStrategy.title}
          </div>
          <div><b>Approach:</b> {hoveredStrategy.approach}</div>
          <div style={{ color: '#94a3b8' }}><b>Impact:</b> {hoveredStrategy.impact}</div>
        </div>
      )}

      {/* Parse Details display */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          AI parsing legal forms and preparing user profile pre-fills...
        </div>
      )}

      {result && (
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Summary Banner */}
          <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--accent-cyan)' }}>
            <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Identified Form Type</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#f8fafc', marginTop: '4px' }}>{result.documentType}</div>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '8px', lineHeight: '1.5' }}>
              <b>Required Action:</b> {result.actionRequired}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }}>
            {/* Visual Timeline / Deadlines */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} style={{ color: '#a855f7' }} />
                Deadline Timeline
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative', paddingLeft: '20px' }}>
                {/* Timeline Line */}
                <div style={{ position: 'absolute', left: '6px', top: '5px', bottom: '5px', width: '2px', background: 'var(--border-dim)' }}></div>

                {/* Event 1 */}
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-19px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', background: '#a855f7' }}></div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Today</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>Document Extracted & Parsed</div>
                </div>

                {/* Event 2 */}
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-19px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', background: '#00f0ff' }}></div>
                  <div style={{ fontSize: '11px', color: '#00f0ff', fontWeight: '700' }}>Target Date: {result.dueDate}</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>Payment/Filing Due</div>
                  <div style={{ fontSize: '11px', color: '#f43f5e', fontWeight: '600', marginTop: '2px' }}>Total Amount: {result.amount}</div>
                </div>
              </div>
            </div>

            {/* Smart Pre-fill Form */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClipboardCheck size={16} style={{ color: '#ec4899' }} />
                Auto-Filled Profile Values
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(result.prefilledFields).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{key}</label>
                    <input 
                      type="text" 
                      value={val} 
                      readOnly 
                      className="input-field" 
                      style={{ 
                        fontSize: '13px', 
                        padding: '8px 12px', 
                        borderColor: 'rgba(0, 240, 255, 0.2)', 
                        background: 'rgba(0, 240, 255, 0.01)',
                        color: '#00f0ff',
                        fontWeight: '500'
                      }} 
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
