import React, { useState, useRef, useEffect } from 'react';
import { Play, Terminal, HelpCircle, CheckCircle2, AlertTriangle, Info, ShieldCheck, Sparkles, Loader } from 'lucide-react';
import { sendRequest } from '../api';

export default function ExecutorTab({ onRefreshFileSystem }) {
  const [command, setCommand] = useState('');
  const [running, setRunning] = useState(false);
  const [executionLogs, setExecutionLogs] = useState([]);
  const [hoveredSuggestion, setHoveredSuggestion] = useState(null);
  const logsEndRef = useRef(null);

  const suggestions = [
    { 
      text: 'Organize my sandbox files', 
      desc: 'Sort files into tidy folders by category',
      approach: 'Scans Sandbox directory recursively, mapping file extensions to Organized/ categories (Images, Documents, Executables, Archives). Safely renames files to their targets and purges temp data.',
      impact: 'Groups messy files into tidy directories; cleans out temporary caches.'
    },
    { 
      text: 'Archive duplicate files', 
      desc: 'Scan MD5 contents and move duplicates',
      approach: 'Performs local MD5 buffer hash check for all sandbox files. Identifies redundant copies with identical hashes and archives duplicates into Archive_Duplicates/ to clear layout view.',
      impact: 'Isolates and archives redundant duplicate content safely.'
    },
    { 
      text: 'Purge temp logs and cache', 
      desc: 'Delete temporary .tmp and .log files',
      approach: 'Traverses the sandbox directory, matches files ending in .tmp and .log, and runs native unlink operations to permanently delete these cache leftovers.',
      impact: 'Frees storage spaces instantly by clearing system activity logs.'
    },
    { 
      text: 'Find banana bread recipe', 
      desc: 'Locate local notes matching bread recipe',
      approach: 'Scans all readable documents inside the sandbox using regex queries matching "banana bread" to output precise lines containing ingredients and recipe instructions.',
      impact: 'Queries local text records to fetch matching information snippets.'
    }
  ];

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [executionLogs]);

  const runCommand = async (cmdText) => {
    if (!cmdText.trim() || running) return;

    setRunning(true);
    setExecutionLogs([
      { step: `User command initiated: "${cmdText}"`, status: 'info' },
      { step: 'Initializing AI Digital Executor engine...', status: 'loader' }
    ]);

    try {
      const data = await sendRequest('/api/execute', 'POST', { command: cmdText });

      if (data.success && data.logs) {
        // Stream the logs one by one for visual effect
        let currentLogs = [
          { step: `User command initiated: "${cmdText}"`, status: 'info' },
          { step: 'Orchestrating automation flow...', status: 'success' }
        ];

        for (let i = 0; i < data.logs.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 600)); // micro-animation delay
          currentLogs = [...currentLogs, data.logs[i]];
          setExecutionLogs([...currentLogs]);
        }

        // Trigger parent filesystem refresh
        onRefreshFileSystem();
      } else {
        setExecutionLogs(prev => [
          ...prev,
          { step: `Execution failed: ${data.error || 'Unknown error'}`, status: 'warning' }
        ]);
      }
    } catch (err) {
      setExecutionLogs(prev => [
        ...prev,
        { step: `Network error: Could not reach backend: ${err.message}`, status: 'warning' }
      ]);
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runCommand(command);
    setCommand('');
  };

  const getLogIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 size={14} style={{ color: '#10b981' }} />;
      case 'done':
        return <ShieldCheck size={14} style={{ color: '#00f0ff' }} />;
      case 'warning':
        return <AlertTriangle size={14} style={{ color: '#f43f5e' }} />;
      case 'info':
        return <Info size={14} style={{ color: '#3b82f6' }} />;
      case 'loader':
        return <Loader size={14} className="animate-spin" style={{ color: '#a855f7' }} />;
      default:
        return <Sparkles size={14} style={{ color: '#f59e0b' }} />;
    }
  };

  const activeStrategy = hoveredSuggestion || suggestions.find(s => s.text.toLowerCase() === command.toLowerCase());

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={24} style={{ color: '#00f0ff' }} />
          AI Digital Executor
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
          Type instructions in plain English. The local agent will safely orchestrate the task.
        </p>
      </div>

      {/* suggestion chips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
        {suggestions.map((s, idx) => (
          <div 
            key={idx} 
            className="glass-card-interactive" 
            onClick={() => !running && setCommand(s.text)}
            onMouseEnter={() => setHoveredSuggestion(s)}
            onMouseLeave={() => setHoveredSuggestion(null)}
            style={{ 
              opacity: running ? 0.6 : 1, 
              pointerEvents: running ? 'none' : 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#00f0ff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal size={12} />
              {s.text}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Strategy Detail Popover */}
      {activeStrategy && (
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
            Action Strategy: {activeStrategy.text}
          </div>
          <div><b>Approach:</b> {activeStrategy.approach}</div>
          <div style={{ color: '#94a3b8' }}><b>Impact:</b> {activeStrategy.impact}</div>
        </div>
      )}

      {/* Terminal Display */}
      <div className={`glass-panel ${running ? 'pulse-border-cyan' : ''}`} style={{ 
        background: 'rgba(5, 7, 10, 0.85)', 
        border: '1px solid rgba(0, 240, 255, 0.15)',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {running && <div className="scanner-overlay"></div>}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.02)', 
          borderBottom: '1px solid var(--border-dim)',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f43f5e' }}></div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
            </div>
            <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>executor-agent@local-host:~</span>
          </div>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Agent Console</span>
        </div>

        <div style={{ 
          padding: '20px', 
          height: '320px', 
          overflowY: 'auto', 
          fontFamily: 'monospace', 
          fontSize: '13px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          background: 'rgba(0, 0, 0, 0.3)'
        }}>
          {executionLogs.length === 0 ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%', 
              color: '#64748b',
              textAlign: 'center',
              gap: '10px'
            }}>
              <Terminal size={32} style={{ opacity: 0.3 }} />
              <div>
                <p>System idle. Awaiting digital commands...</p>
                <p style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>Click a pre-made instruction above or write your own below.</p>
              </div>
            </div>
          ) : (
            executionLogs.map((log, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '10px', 
                lineHeight: '1.5',
                color: log.status === 'warning' ? '#f43f5e' : log.status === 'success' ? '#10b981' : '#f8fafc',
                animation: 'slideUp 0.15s ease forwards'
              }}>
                <div style={{ marginTop: '2px' }}>{getLogIcon(log.status)}</div>
                <div style={{ flexGrow: 1 }}>
                  {log.step}
                  {idx === executionLogs.length - 1 && running && <span className="terminal-cursor">█</span>}
                </div>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* input bar */}
      <form onSubmit={handleSubmit} className="executor-input-form" style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="e.g., Organize sandbox folder or Archive duplicate PDFs..." 
          disabled={running}
          className="input-field"
          style={{ flexGrow: 1 }}
        />
        <button 
          type="submit" 
          disabled={running || !command.trim()}
          className="btn-primary"
          style={{ flexShrink: 0 }}
        >
          {running ? (
            <>
              <Loader size={16} className="animate-spin" />
              Executing...
            </>
          ) : (
            <>
              <Play size={16} />
              Run Execution
            </>
          )}
        </button>
      </form>
    </div>
  );
}
