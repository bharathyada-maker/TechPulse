import { useState } from 'react';
import { 
  Users, AlertCircle, Search, MessageSquare, 
  Send, ChevronRight, Check
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  pan: string;
  itrType: string;
  progress: number; // 0 to 100
  status: 'AIS Mapped' | 'Computed' | 'Verified' | 'Filed' | 'Action Needed';
  lastActive: string;
}

export default function CAPortal() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>('1');
  const [chatMessage, setChatMessage] = useState('');
  
  const [clients, setClients] = useState<Client[]>([
    { id: '1', name: 'Rajesh Sharma', pan: 'APHPS8293M', itrType: 'ITR-1', progress: 40, status: 'AIS Mapped', lastActive: '2 hours ago' },
    { id: '2', name: 'Priya Patel', pan: 'BTLPP9381A', itrType: 'ITR-2', progress: 80, status: 'Computed', lastActive: '1 day ago' },
    { id: '3', name: 'Kunal Kapoor', pan: 'COKKK2840P', itrType: 'ITR-3', progress: 100, status: 'Filed', lastActive: '3 days ago' },
    { id: '4', name: 'Sneha Gupta', pan: 'DKSGG3920F', itrType: 'ITR-4', progress: 15, status: 'Action Needed', lastActive: '10 mins ago' }
  ]);

  const [chats, setChats] = useState<{ [clientId: string]: Array<{ sender: 'ca' | 'client'; text: string; time: string }> }>({
    '1': [
      { sender: 'client', text: 'Hello, I have uploaded my Form 16. Can you review it?', time: '10:30 AM' },
      { sender: 'ca', text: 'Yes Rajesh, I see it. Mapped your salary income. Need your bank statement for dividend mapping.', time: '11:15 AM' },
      { sender: 'client', text: 'Sure, sending it shortly.', time: '11:20 AM' }
    ],
    '4': [
      { sender: 'ca', text: 'Hi Sneha, the business income is exceeding ₹20 lakhs, so ITR-4 is not valid. We should file under ITR-3.', time: 'Yesterday' },
      { sender: 'client', text: 'Oh, okay. What extra documents do you need?', time: 'Yesterday' }
    ]
  });

  const activeClient = clients.find(c => c.id === selectedClientId);

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !selectedClientId) return;
    const newMsg = {
      sender: 'ca' as const,
      text: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChats(prev => ({
      ...prev,
      [selectedClientId]: [...(prev[selectedClientId] || []), newMsg]
    }));
    setChatMessage('');
  };

  const handleApproveCalculation = (id: string) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, progress: 80, status: 'Computed' } : c));
  };

  const handleRequestDocument = (id: string) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, status: 'Action Needed' } : c));
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.pan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr', gap: '24px' }} className="grid-responsive-ca">
      
      {/* Left Column: Client List */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} style={{ color: 'var(--accent-primary)' }} />
            CA Client Management Workspace
          </h3>
          <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
            Active Clients: {clients.length}
          </span>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by name, PAN or ITR form..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>

        {/* Client Rows list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredClients.map(c => {
            const isSelected = c.id === selectedClientId;
            return (
              <div 
                key={c.id} 
                style={{ 
                  padding: '14px', 
                  borderRadius: '12px', 
                  backgroundColor: isSelected ? 'var(--bg-tertiary)' : 'var(--bg-secondary)', 
                  border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onClick={() => setSelectedClientId(c.id)}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{c.name}</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{c.lastActive}</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>PAN: {c.pan}</span>
                    <span style={{ color: 'var(--text-muted)' }}>•</span>
                    <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{c.itrType}</span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <div style={{ flex: 1, height: '4px', backgroundColor: 'var(--bg-primary)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${c.progress}%`, height: '100%', backgroundColor: c.status === 'Action Needed' ? 'var(--accent-danger)' : c.progress === 100 ? 'var(--accent-success)' : 'var(--accent-primary)' }}></div>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{c.progress}%</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    fontWeight: 600,
                    backgroundColor: c.status === 'Filed' ? 'rgba(16, 185, 129, 0.1)' : c.status === 'Action Needed' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                    color: c.status === 'Filed' ? 'var(--accent-success)' : c.status === 'Action Needed' ? 'var(--accent-danger)' : 'var(--accent-primary)'
                  }}>
                    {c.status}
                  </span>
                  <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Selected Client Workspace Details & Chat */}
      {activeClient && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Worksheets & Actions */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Reviewing Return: {activeClient.name}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{activeClient.pan}</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Filing Form Type</span>
                <strong>{activeClient.itrType}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Mapped Gross Income</span>
                <strong>₹15,40,000</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Exemptions Verified</span>
                <strong>₹2,45,000</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Calculated Net Taxes</span>
                <strong style={{ color: 'var(--accent-primary)' }}>₹1,12,500</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-success" 
                style={{ flex: 1, fontSize: '0.85rem' }} 
                onClick={() => handleApproveCalculation(activeClient.id)}
                disabled={activeClient.status === 'Computed' || activeClient.status === 'Filed'}
              >
                <Check size={14} /> Verify & Compute
              </button>
              <button 
                className="btn btn-outline" 
                style={{ flex: 1, fontSize: '0.85rem', color: 'var(--accent-danger)' }}
                onClick={() => handleRequestDocument(activeClient.id)}
                disabled={activeClient.status === 'Action Needed'}
              >
                <AlertCircle size={14} /> Request Document Fix
              </button>
            </div>
          </div>

          {/* Client Messenger */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '300px' }}>
            <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
              <MessageSquare size={16} style={{ color: 'var(--accent-primary)' }} />
              Client Communication Channel
            </h4>

            {/* Chat Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(chats[activeClient.id] || []).map((msg, idx) => (
                <div 
                  key={idx} 
                  style={{
                    alignSelf: msg.sender === 'ca' ? 'flex-end' : 'flex-start',
                    backgroundColor: msg.sender === 'ca' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                    color: msg.sender === 'ca' ? '#ffffff' : 'var(--text-primary)',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    maxWidth: '85%',
                    border: msg.sender === 'ca' ? 'none' : '1px solid var(--border-color)',
                    lineHeight: '1.4'
                  }}
                >
                  <div>{msg.text}</div>
                  <div style={{ fontSize: '0.65rem', color: msg.sender === 'ca' ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', textAlign: 'right', marginTop: '2px' }}>
                    {msg.time}
                  </div>
                </div>
              ))}
            </div>

            {/* Input field */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <input 
                type="text" 
                placeholder={`Message ${activeClient.name}...`} 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                style={{ fontSize: '0.85rem', padding: '8px 12px' }}
              />
              <button className="btn btn-primary" style={{ padding: '8px' }} onClick={handleSendMessage}>
                <Send size={14} />
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
