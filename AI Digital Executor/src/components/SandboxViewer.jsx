import React from 'react';
import { 
  Folder, 
  File, 
  FileText, 
  Image, 
  Archive, 
  Terminal, 
  RotateCcw, 
  ShieldAlert,
  Loader
} from 'lucide-react';

export default function SandboxViewer({ files, totalSize, totalFiles, onReset, loading, refreshing }) {
  
  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
      return <Image size={14} className="text-pink-400 text-accent-pink" style={{ color: '#ec4899' }} />;
    }
    if (['pdf', 'txt', 'docx', 'csv', 'xlsx'].includes(ext)) {
      return <FileText size={14} className="text-blue-400 text-accent-blue" style={{ color: '#3b82f6' }} />;
    }
    if (['zip', 'rar', 'tar', 'gz'].includes(ext)) {
      return <Archive size={14} className="text-purple-400 text-accent-purple" style={{ color: '#a855f7' }} />;
    }
    if (['exe', 'msi', 'bat'].includes(ext)) {
      return <Terminal size={14} className="text-red-400 text-accent-rose" style={{ color: '#f43f5e' }} />;
    }
    return <File size={14} className="text-gray-400 text-text-muted" style={{ color: '#64748b' }} />;
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Group files by directory
  const buildTree = () => {
    const tree = {};
    files.forEach(f => {
      const parts = f.path.split('/');
      let current = tree;
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          // File
          current[part] = { _type: 'file', size: f.size, path: f.path };
        } else {
          // Folder
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
      });
    });
    return tree;
  };

  const renderTree = (node, depth = 0) => {
    return Object.keys(node).sort().map(key => {
      const val = node[key];
      if (val._type === 'file') {
        return (
          <div 
            key={val.path} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '6px 8px', 
              paddingLeft: `${depth * 16 + 8}px`,
              fontSize: '13px',
              fontFamily: 'monospace',
              borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
              animation: 'slideUp 0.2s ease forwards'
            }}
            className="sandbox-file-row file-mount-animation"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {getFileIcon(key)}
              <span style={{ color: '#f8fafc' }}>{key}</span>
            </div>
            <span style={{ color: '#64748b', fontSize: '11px' }}>{formatSize(val.size)}</span>
          </div>
        );
      } else {
        // Node is folder
        return (
          <div key={key}>
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '6px 8px', 
                paddingLeft: `${depth * 16 + 8}px`,
                fontSize: '13px',
                fontWeight: '600',
                gap: '8px',
                color: '#94a3b8',
                background: 'rgba(255, 255, 255, 0.01)'
              }}
            >
              <Folder size={14} style={{ color: '#3b82f6' }} />
              <span>{key}</span>
            </div>
            {renderTree(val, depth + 1)}
          </div>
        );
      }
    });
  };

  const treeData = buildTree();

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', gap: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Sandbox Filesystem
            {refreshing && <Loader size={14} className="animate-spin" style={{ color: '#00f0ff', animation: 'spin 1s linear infinite' }} />}
          </h3>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>Real-time workspace mirror</p>
        </div>
        
        <button 
          onClick={onReset} 
          disabled={loading}
          className="btn-secondary" 
          style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RotateCcw size={12} />
          Reset Sandbox
        </button>
      </div>

      <div style={{ display: 'flex', gap: '15px', background: 'rgba(255, 255, 255, 0.02)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-dim)' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#00f0ff' }}>{totalFiles}</div>
          <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Files</div>
        </div>
        <div style={{ width: '1px', background: 'var(--border-dim)' }}></div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#a855f7' }}>{formatSize(totalSize)}</div>
          <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Total Size</div>
        </div>
      </div>

      <div style={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        border: '1px solid var(--border-dim)', 
        borderRadius: '8px', 
        background: 'rgba(0, 0, 0, 0.2)',
        minHeight: '280px'
      }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '10px', padding: '40px 0' }}>
            <Loader size={24} style={{ color: '#00f0ff', animation: 'spin 2s linear infinite' }} />
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Loading file structure...</span>
          </div>
        ) : files.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '10px', padding: '40px 0', textAlign: 'center' }}>
            <ShieldAlert size={24} style={{ color: '#f59e0b' }} />
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Sandbox is empty. Reset to populate files.</span>
          </div>
        ) : (
          renderTree(treeData)
        )}
      </div>

      <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div className="status-dot success active"></div>
        <span>Directory: /demo_sandbox (sandboxed filesystem)</span>
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
