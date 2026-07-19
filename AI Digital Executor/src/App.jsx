import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Layers, 
  ShieldAlert, 
  Search, 
  FileCheck2, 
  Activity, 
  Cpu, 
  Globe 
} from 'lucide-react';
import SandboxViewer from './components/SandboxViewer';
import ExecutorTab from './components/ExecutorTab';
import ClutterTab from './components/ClutterTab';
import ScamShieldTab from './components/ScamShieldTab';
import LifeSearchTab from './components/LifeSearchTab';
import BureaucracyTab from './components/BureaucracyTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('executor');
  const [files, setFiles] = useState([]);
  const [totalSize, setTotalSize] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFilesystemStatus = async (showRefresher = false) => {
    if (showRefresher) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/sandbox/status');
      const data = await response.json();
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
      const response = await fetch('http://localhost:3001/api/sandbox/reset', {
        method: 'POST'
      });
      const data = await response.json();
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
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        {/* Title / Logo */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-dim)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu size={24} style={{ color: '#00f0ff' }} className="pulse-glow" />
            <h1 className="text-glow-cyan" style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #00f0ff, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Antigravity OS
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
            <span className="status-dot success active"></span>
            <span>Local AI Layer Online</span>
          </div>
        </div>

        {/* Links */}
        <nav style={{ padding: '20px 12px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
            >
              {item.icon}
              {item.name}
            </div>
          ))}
        </nav>

        {/* Footer / Info */}
        <div style={{ padding: '20px', borderTop: '1px solid var(--border-dim)', background: 'rgba(0, 0, 0, 0.15)', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: '#64748b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Network Host:</span>
            <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>localhost:3001</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Sandboxed Mode:</span>
            <span style={{ color: '#10b981', fontWeight: '600' }}>Enabled</span>
          </div>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="main-content">
        <div className="dashboard-grid">
          {/* Active Tab View */}
          <div className="glass-panel" style={{ padding: '24px', minHeight: '520px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
