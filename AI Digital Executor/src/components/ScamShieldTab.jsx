import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Sparkles, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { sendRequest } from '../api';

export default function ScamShieldTab() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [hoveredStrategy, setHoveredStrategy] = useState(null);

  const templates = [
    {
      title: 'Crypto Scam SMS',
      text: 'CONGRATULATIONS! You have been selected to claim 5.0 BTC! Click http://bit.ly/claim-your-crypto-now to login and verify your identity immediately.'
    },
    {
      title: 'Fake Job Scheme',
      text: 'Dear candidate, we reviewed your resume and offer you a remote data entry position. Salary is $5,000/week. Please purchase a starting equipment package using target gift cards and send us your SSN.'
    },
    {
      title: 'Legitimate Notice',
      text: 'Hello, your monthly water bill invoice is ready. Please view invoice #98212 by logging into your Water Corp utility account. No action is required if you are on autopay.'
    }
  ];

  const handleAnalyze = async (textToAnalyze) => {
    const text = textToAnalyze || content;
    if (!text.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await sendRequest('/api/scam/analyze', 'POST', { content: text });
      if (data.success) {
        setResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDialColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 50) return '#f59e0b'; // Amber
    return '#f43f5e'; // Red
  };

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={24} style={{ color: '#f43f5e' }} />
          Scam Shield AI
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
          Scan suspicious text messages, job offers, links, or emails to detect fraudulent intent.
        </p>
      </div>

      {/* templates */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {templates.map((t, idx) => (
          <button
            key={idx}
            onClick={() => {
              setContent(t.text);
              handleAnalyze(t.text);
            }}
            onMouseEnter={() => setHoveredStrategy({ title: `Load ${t.title}`, approach: 'Populates the input text area with a pre-configured scam/notice template for testing.', impact: 'Saves typing and allows immediate inspection of safety heuristics.' })}
            onMouseLeave={() => setHoveredStrategy(null)}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            Load {t.title}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Suspicious Communication Body</h3>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste SMS, emails, investment pitches, website URLs, or notice texts here..."
          rows={6}
          className="input-field"
          style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', fontSize: '14px' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => handleAnalyze()} 
            disabled={loading || !content.trim()}
            onMouseEnter={() => setHoveredStrategy({ title: 'Analyze Message', approach: 'Evaluates text sequences against custom heuristics checks for credentials, prize keywords, crypto wallets, and URL redirection filters.', impact: 'Computes a safety score, lists matches, and recommends steps.' })}
            onMouseLeave={() => setHoveredStrategy(null)}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
            Analyze Message
          </button>
        </div>
      </div>

      {/* Strategy Detail Popover */}
      {hoveredStrategy && (
        <div className="glass-panel animate-slide-up" style={{
          padding: '16px',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          background: 'rgba(244, 63, 94, 0.02)',
          borderRadius: '10px',
          fontSize: '13px',
          color: '#e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          boxShadow: '0 4px 20px rgba(244, 63, 94, 0.04)'
        }}>
          <div style={{ fontWeight: '700', color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} />
            Action Strategy: {hoveredStrategy.title}
          </div>
          <div><b>Approach:</b> {hoveredStrategy.approach}</div>
          <div style={{ color: '#94a3b8' }}><b>Impact:</b> {hoveredStrategy.impact}</div>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="glass-panel animate-slide-up" style={{ 
          padding: '24px', 
          border: `1px solid ${result.color}25`, 
          background: `${result.color}05`,
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Header Score Info */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                border: `4px solid ${result.color}`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '18px',
                color: '#f8fafc',
                boxShadow: `0 0 15px ${result.color}20`
              }}>
                {result.score}%
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#f8fafc' }}>
                  {result.status}
                </div>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
                  Safety Trust Index score
                </div>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: `${result.color}15`, 
              padding: '6px 12px', 
              borderRadius: '20px', 
              border: `1px solid ${result.color}30`,
              fontSize: '12px',
              fontWeight: '600',
              color: result.color
            }}>
              {result.score < 50 ? <ShieldAlert size={14} /> : result.score < 80 ? <AlertTriangle size={14} /> : <ShieldCheck size={14} />}
              {result.score < 50 ? 'Danger detected' : result.score < 80 ? 'Warning issued' : 'Verified safe'}
            </div>
          </div>

          <div style={{ height: '1px', background: 'var(--border-dim)' }}></div>

          {/* Triggered items list */}
          {result.triggers.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#94a3b8' }}>Risk Indicators Identified:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {result.triggers.map((trig, idx) => (
                  <div key={idx} style={{ 
                    background: 'rgba(255, 255, 255, 0.01)', 
                    border: '1px solid var(--border-dim)', 
                    borderRadius: '8px', 
                    padding: '12px' 
                  }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      {trig.words.map((w, wIdx) => (
                        <span key={wIdx} style={{ 
                          fontSize: '11px', 
                          fontWeight: '700', 
                          fontFamily: 'monospace', 
                          background: 'rgba(244, 63, 94, 0.1)', 
                          color: '#f43f5e', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          border: '1px solid rgba(244, 63, 94, 0.2)'
                        }}>
                          "{w}"
                        </span>
                      ))}
                    </div>
                    <p style={{ fontSize: '13px', color: '#f8fafc' }}>{trig.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safer Steps list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#94a3b8' }}>Safety Recommendations:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {result.recommendations.map((rec, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#e2e8f0' }}>
                  <CheckCircle2 size={14} style={{ color: result.score < 80 ? '#f59e0b' : '#10b981', flexShrink: 0 }} />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
