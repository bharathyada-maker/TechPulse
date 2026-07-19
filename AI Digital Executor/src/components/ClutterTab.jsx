import React, { useState, useEffect } from 'react';
import { Trash2, ShieldAlert, Sparkles, Filter, RefreshCw, Layers, HardDrive, CheckSquare, Square } from 'lucide-react';

export default function ClutterTab({ onRefreshFileSystem }) {
  const [duplicates, setDuplicates] = useState([]);
  const [tempFiles, setTempFiles] = useState([]);
  const [largeFiles, setLargeFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [hoveredStrategy, setHoveredStrategy] = useState(null);

  const scanClutter = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/clutter/scan');
      const data = await response.json();
      if (data.success) {
        setDuplicates(data.duplicates);
        setTempFiles(data.tempFiles);
        setLargeFiles(data.largeFiles);
        setSelectedFiles([]); // clear selections
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scanClutter();
  }, []);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleToggleFile = (path) => {
    if (selectedFiles.includes(path)) {
      setSelectedFiles(selectedFiles.filter(f => f !== path));
    } else {
      setSelectedFiles([...selectedFiles, path]);
    }
  };

  const handleCleanClutter = async () => {
    if (selectedFiles.length === 0) return;
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/clutter/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: selectedFiles })
      });
      const data = await response.json();
      if (data.success) {
        // Refresh scan and filesystem
        await scanClutter();
        onRefreshFileSystem();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectAllTemp = () => {
    const tempPaths = tempFiles.map(f => f.path);
    setSelectedFiles(prev => Array.from(new Set([...prev, ...tempPaths])));
  };

  const selectAllDuplicates = () => {
    const dupPaths = duplicates.map(f => f.duplicate);
    setSelectedFiles(prev => Array.from(new Set([...prev, ...dupPaths])));
  };

  const totalClutterSize = 
    duplicates.reduce((acc, curr) => acc + curr.size, 0) + 
    tempFiles.reduce((acc, curr) => acc + curr.size, 0);

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={24} style={{ color: '#a855f7' }} />
            Digital Clutter Doctor
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
            Analyze storage space. View duplicate memories, installer packages, and cache dumps.
          </p>
        </div>

        <button 
          onClick={scanClutter} 
          disabled={loading} 
          onMouseEnter={() => setHoveredStrategy({ title: 'Scan Sandbox Space', approach: 'Crawls sandboxed directories recursively, sorting active files by size, extension, and date metadata.', impact: 'Discovers duplicate files, temporary cache logs, and oversized dump files.' })}
          onMouseLeave={() => setHoveredStrategy(null)}
          className="btn-secondary"
          style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Scan Space
        </button>
      </div>

      {/* Storage meter layout */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ padding: '16px', background: 'rgba(168, 85, 247, 0.05)', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
          <HardDrive size={32} style={{ color: '#a855f7' }} />
        </div>
        <div style={{ flexGrow: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
            <span style={{ fontWeight: '600' }}>Removable Clutter Found</span>
            <span style={{ color: '#a855f7', fontWeight: '700' }}>{formatSize(totalClutterSize)}</span>
          </div>
          <div className="threat-meter">
            <div 
              className="threat-bar" 
              style={{ 
                width: totalClutterSize > 0 ? '70%' : '0%', 
                background: 'linear-gradient(90deg, #a855f7, #f43f5e)' 
              }}
            ></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
            <span>0 B Clutter</span>
            <span>Unchecked Redundancy Risk</span>
          </div>
        </div>
      </div>

      {/* Strategy Detail Popover */}
      {hoveredStrategy && (
        <div className="glass-panel animate-slide-up" style={{
          padding: '16px',
          border: '1px solid rgba(168, 85, 247, 0.25)',
          background: 'rgba(168, 85, 247, 0.02)',
          borderRadius: '10px',
          fontSize: '13px',
          color: '#e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          boxShadow: '0 4px 20px rgba(168, 85, 247, 0.04)'
        }}>
          <div style={{ fontWeight: '700', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} />
            Action Strategy: {hoveredStrategy.title}
          </div>
          <div><b>Approach:</b> {hoveredStrategy.approach}</div>
          <div style={{ color: '#94a3b8' }}><b>Impact:</b> {hoveredStrategy.impact}</div>
        </div>
      )}

      {/* Grid of clutter lists */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        
        {/* Duplicates Section */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} style={{ color: '#00f0ff' }} />
              Duplicate Files ({duplicates.length})
            </h3>
            {duplicates.length > 0 && (
              <button 
                onClick={selectAllDuplicates} 
                className="btn-secondary" 
                style={{ padding: '4px 8px', fontSize: '11px' }}
              >
                Select All
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {duplicates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '13px' }}>
                No duplicate file matches in sandbox.
              </div>
            ) : (
              duplicates.map((dup, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleToggleFile(dup.duplicate)}
                  onMouseEnter={() => setHoveredStrategy({ title: 'Duplicate Matcher', approach: 'Analyzes files in sandbox using MD5 content hash arrays to query exact matching structures.', impact: 'Highlights redundant duplicate elements for deletion while leaving the original file safe.' })}
                  onMouseLeave={() => setHoveredStrategy(null)}
                  className="glass-card-interactive" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '12px 16px',
                    borderColor: selectedFiles.includes(dup.duplicate) ? 'var(--accent-cyan)' : 'var(--border-dim)',
                    background: selectedFiles.includes(dup.duplicate) ? 'rgba(0, 240, 255, 0.02)' : 'rgba(255, 255, 255, 0.015)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {selectedFiles.includes(dup.duplicate) ? (
                      <CheckSquare size={16} style={{ color: '#00f0ff' }} />
                    ) : (
                      <Square size={16} style={{ color: '#64748b' }} />
                    )}
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#f43f5e' }}>{dup.duplicate.split('/').pop()}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Original: {dup.original}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8' }}>{formatSize(dup.size)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Temporary Files Section */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} style={{ color: '#f59e0b' }} />
              System Logs & Temporary Cache ({tempFiles.length})
            </h3>
            {tempFiles.length > 0 && (
              <button 
                onClick={selectAllTemp} 
                className="btn-secondary" 
                style={{ padding: '4px 8px', fontSize: '11px' }}
              >
                Select All
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tempFiles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '13px' }}>
                No temporary files detected.
              </div>
            ) : (
              tempFiles.map((file, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleToggleFile(file.path)}
                  onMouseEnter={() => setHoveredStrategy({ title: 'Temporary Logs & Caches', approach: 'Matches files by .tmp and .log extensions, which accumulate over time from runtime operations.', impact: 'Removes trace debris and helps free storage space.' })}
                  onMouseLeave={() => setHoveredStrategy(null)}
                  className="glass-card-interactive" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '12px 16px',
                    borderColor: selectedFiles.includes(file.path) ? 'var(--accent-cyan)' : 'var(--border-dim)',
                    background: selectedFiles.includes(file.path) ? 'rgba(0, 240, 255, 0.02)' : 'rgba(255, 255, 255, 0.015)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {selectedFiles.includes(file.path) ? (
                      <CheckSquare size={16} style={{ color: '#00f0ff' }} />
                    ) : (
                      <Square size={16} style={{ color: '#64748b' }} />
                    )}
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{file.path.split('/').pop()}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Path: {file.path}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8' }}>{formatSize(file.size)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Large Files Monitor Section */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={16} style={{ color: '#f43f5e' }} />
            Large Files Monitor ({largeFiles.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {largeFiles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '13px' }}>
                No large items tracked in sandbox files.
              </div>
            ) : (
              largeFiles.map((file, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleToggleFile(file.path)}
                  onMouseEnter={() => setHoveredStrategy({ title: 'Large Files Monitor', approach: 'Filters workspace content by size indexes (>1 KB inside sandbox) to discover storage allocation peaks.', impact: 'Helps identify oversized zip archives or crash log directories.' })}
                  onMouseLeave={() => setHoveredStrategy(null)}
                  className="glass-card-interactive" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '12px 16px',
                    borderColor: selectedFiles.includes(file.path) ? 'var(--accent-cyan)' : 'var(--border-dim)',
                    background: selectedFiles.includes(file.path) ? 'rgba(0, 240, 255, 0.02)' : 'rgba(255, 255, 255, 0.015)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {selectedFiles.includes(file.path) ? (
                      <CheckSquare size={16} style={{ color: '#00f0ff' }} />
                    ) : (
                      <Square size={16} style={{ color: '#64748b' }} />
                    )}
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{file.path.split('/').pop()}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Path: {file.path}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#f43f5e' }}>{formatSize(file.size)}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Sticky clean button panel */}
      {selectedFiles.length > 0 && (
        <div className="glass-panel" style={{ 
          padding: '15px 20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          background: 'rgba(244, 63, 94, 0.05)',
          animation: 'slideUp 0.2s ease forwards'
        }}>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>
            Selected <span style={{ color: '#f43f5e' }}>{selectedFiles.length}</span> item(s) for permanent purging.
          </span>
          <button 
            onClick={handleCleanClutter} 
            disabled={loading}
            onMouseEnter={() => setHoveredStrategy({ title: 'Clean Selected Items', approach: 'Accepts a payload of filesystem paths relative to the sandbox and executes Node fs.unlink on each to permanently free storage.', impact: 'Deletes selected redundancies and trash logs instantly.' })}
            onMouseLeave={() => setHoveredStrategy(null)}
            className="btn-primary" 
            style={{ 
              background: 'linear-gradient(135deg, #f43f5e, #ec4899)', 
              boxShadow: '0 4px 15px rgba(244, 63, 94, 0.25)' 
            }}
          >
            <Trash2 size={16} />
            Clean Selected
          </button>
        </div>
      )}
    </div>
  );
}
