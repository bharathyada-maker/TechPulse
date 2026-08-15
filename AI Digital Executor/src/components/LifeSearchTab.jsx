import React, { useState } from 'react';
import { Search, FileText, Sparkles, AlertCircle } from 'lucide-react';
import { sendRequest } from '../api';

export default function LifeSearchTab() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hoveredStrategy, setHoveredStrategy] = useState(null);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await sendRequest(`/api/search?query=${encodeURIComponent(query)}`);
      if (data.success) {
        setResults(data.results);
        setSearched(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} style={{ background: 'rgba(0, 240, 255, 0.2)', color: '#00f0ff', padding: '0 2px', borderRadius: '2px', fontWeight: '600' }}>{part}</mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={24} style={{ color: '#00f0ff' }} />
          Life Search Engine
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
          Query your localized memory database. Indexes text notes, logs, PDFs, and invoices instantly.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
        <div style={{ position: 'relative', flexGrow: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search details like 'Kubernetes', 'passport', 'recipe', 'june', 'water'..."
            className="input-field"
            style={{ width: '100%', paddingLeft: '48px' }}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading || !query.trim()} 
          onMouseEnter={() => setHoveredStrategy({ title: 'Local Index Search', approach: 'Queries readable sandbox files (.txt, .pdf, .json, .log) via JavaScript RegExp queries matching search terms.', impact: 'Extracts matching snippets and line indicators in real time.' })}
          onMouseLeave={() => setHoveredStrategy(null)}
          className="btn-primary"
        >
          Search
        </button>
      </form>

      {/* Strategy Detail Popover */}
      {hoveredStrategy && (
        <div className="glass-panel animate-slide-up" style={{
          padding: '16px',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          background: 'rgba(0, 240, 255, 0.02)',
          borderRadius: '10px',
          fontSize: '13px',
          color: '#e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          boxShadow: '0 4px 20px rgba(0, 240, 255, 0.04)'
        }}>
          <div style={{ fontWeight: '700', color: '#00f0ff', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} />
            Action Strategy: {hoveredStrategy.title}
          </div>
          <div><b>Approach:</b> {hoveredStrategy.approach}</div>
          <div style={{ color: '#94a3b8' }}><b>Impact:</b> {hoveredStrategy.impact}</div>
        </div>
      )}

      {/* Search Results Display */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Searching database index...
          </div>
        ) : results.length === 0 ? (
          searched ? (
            <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={24} style={{ color: '#f59e0b' }} />
              <span>No direct keyword matches found inside sandbox.</span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Try looking for "kubernetes", "recipe", "passport", "invoice", "logs"</span>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#94a3b8' }}>Search tips:</h4>
              <ul style={{ fontSize: '13px', color: '#64748b', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Type <b>"Kubernetes"</b> to find container guide files.</li>
                <li>Type <b>"passport"</b> to retrieve Jane Doe's passport scan records.</li>
                <li>Type <b>"recipe"</b> to find banana bread ingredients.</li>
                <li>Type <b>"invoice"</b> to find invoice PDFs.</li>
              </ul>
            </div>
          )
        ) : (
          results.map((res, idx) => (
            <div key={idx} className="glass-panel animate-slide-up" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* File details Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={18} style={{ color: '#3b82f6' }} />
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#f8fafc' }}>{res.filename}</h4>
                  <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>demo_sandbox/{res.path}</span>
                </div>
              </div>

              {/* Snippets match details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0, 0, 0, 0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-dim)' }}>
                {res.snippets.map((snip, snIdx) => (
                  <div key={snIdx} style={{ display: 'flex', gap: '10px', fontSize: '12px', fontFamily: 'monospace' }}>
                    <span style={{ color: '#64748b', width: '25px', textAlign: 'right' }}>L{snip.lineNumber}:</span>
                    <span style={{ color: '#e2e8f0', flexGrow: 1 }}>{highlightText(snip.text, query)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
