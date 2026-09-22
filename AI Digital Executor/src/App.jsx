import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Layers, 
  ShieldAlert, 
  Search, 
  FileCheck2, 
  Activity, 
  Cpu, 
  Globe,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import SandboxViewer from './components/SandboxViewer';
import ExecutorTab from './components/ExecutorTab';
import ClutterTab from './components/ClutterTab';
import ScamShieldTab from './components/ScamShieldTab';
import LifeSearchTab from './components/LifeSearchTab';
import BureaucracyTab from './components/BureaucracyTab';

import { sendRequest } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('executor');
  const [theme, setTheme] = useState('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [totalSize, setTotalSize] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const fetchFilesystemStatus = async (showRefresher = false) => {
    if (showRefresher) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await sendRequest('/api/sandbox/status');
      if (data.success) {
        setFiles(data.files);
        setTotalSize(data.totalSize);
        setTotalFiles(data.totalFiles);
      }
    } catch (err) {
      console.error("Failed to fetch filesystem status", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleResetSandbox = async () => {
    setLoading(true);
    try {
      const data = await sendRequest('/api/sandbox/reset', 'POST');
      if (data.success) {
        await fetchFilesystemStatus();
      }
    } catch (err) {
      console.error("Failed to reset sandbox", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilesystemStatus();
  }, []);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'executor':
        return <ExecutorTab onRefreshFileSystem={() => fetchFilesystemStatus(true)} />;
      case 'clutter':
        return <ClutterTab onRefreshFileSystem={() => fetchFilesystemStatus(true)} />;
      case 'scam':
        return <ScamShieldTab />;
      case 'search':
        return <LifeSearchTab />;
      case 'bureaucracy':
        return <BureaucracyTab />;
      default:
        return <ExecutorTab onRefreshFileSystem={() => fetchFilesystemStatus(true)} />;
    }
  };

  const navItems = [
    { id: 'executor', name: 'AI Digital Executor', icon: <Terminal size={18} /> },
    { id: 'clutter', name: 'Clutter Doctor', icon: <Layers size={18} /> },
    { id: 'scam', name: 'Scam Shield AI', icon: <ShieldAlert size={18} /> },
    { id: 'search', name: 'Life Search Engine', icon: <Search size={18} /> },
    { id: 'bureaucracy', name: 'Bureaucracy Assistant', icon: <FileCheck2 size={18} /> }
  ];

  return (
    <div className="app-container">
      {/* Mobile Top Navigation Bar */}
      <header className="mobile-topbar">
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px' }}
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={20} style={{ color: 'var(--accent-cyan)' }} />
          <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)' }}>Antigravity OS</span>
        </div>

        <button 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px' }}
          aria-label="Toggle Theme"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </header>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        {/* Title / Logo */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-dim)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Cpu size={22} style={{ color: 'var(--accent-cyan)' }} className="pulse-glow" />
              <h1 className="text-glow-cyan" style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.03em', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Antigravity OS
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span className="status-dot success active"></span>
              <span>Local AI Layer Online</span>
            </div>
          </div>

          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px', borderRadius: '6px' }}
            aria-label="Toggle Theme"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

        {/* Links */}
        <nav style={{ padding: '16px 12px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(item => (
            <div
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
            >
              {item.icon}
              {item.name}
            </div>
          ))}
        </nav>

        {/* Footer / Info */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-dim)', background: 'rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Network Host:</span>
            <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>localhost:3001</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Sandboxed Mode:</span>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: '600' }}>Enabled</span>
          </div>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="main-content">
        <div className="dashboard-grid">
          {/* Active Tab View */}
          <div className="glass-panel" style={{ padding: '20px', minHeight: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {renderActiveTab()}
          </div>

          {/* Sandbox Live Explorer View */}
          <div>
            <SandboxViewer 
              files={files} 
              totalSize={totalSize} 
              totalFiles={totalFiles} 
              onReset={handleResetSandbox}
              loading={loading}
              refreshing={refreshing}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
