import { useState, useEffect } from 'react';
import { 
  Menu, X, Sun, Moon, Bell, User, FileText, Briefcase, 
  Settings, Award, HelpCircle, Landmark, Sparkles, CheckSquare, Calendar
} from 'lucide-react';

// Components
import Dashboard from './components/Dashboard';
import TaxOptimizer from './components/TaxOptimizer';
import ITRFiling from './components/ITRFiling';
import AIAssistant from './components/AIAssistant';
import GSTModule from './components/GSTModule';
import Bookkeeping from './components/Bookkeeping';
import CAPortal from './components/CAPortal';
import AdminPanel from './components/AdminPanel';
import LoanCenter from './components/LoanCenter';
import FinancialPlanner from './components/FinancialPlanner';

// Helpers
import type { IncomeSources, ClaimedDeductions, CalculationResult } from './utils/taxCalculator';
import { calculateTax } from './utils/taxCalculator';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  // Navigation & Persona states
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeRole, setActiveRole] = useState<'taxpayer' | 'business' | 'ca' | 'admin'>('taxpayer');
  const [assessmentYear, setAssessmentYear] = useState<'AY-2025-26' | 'AY-2024-25'>('AY-2025-26');
  
  // Custom edited rules from Admin Panel
  const [customRules, setCustomRules] = useState<any>(null);

  // Responsive Drawer state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Notification Drawer state
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const [notificationsList, setNotificationsList] = useState([
    { id: '1', title: 'Upcoming GST GSTR-1 Due Date', desc: 'File your monthly outward return by July 11, 2026.', read: false, time: '2 hours ago' },
    { id: '2', title: 'AIS Update Received', desc: 'New dividend income of ₹12,000 reported from mutual funds.', read: false, time: '5 hours ago' },
    { id: '3', title: 'ITR acknowledgement generated', desc: 'Your standard calculation is saved under draft return.', read: true, time: '1 day ago' }
  ]);

  // Global Financial Data state
  const [income, setIncome] = useState<IncomeSources>({
    salary: 1200000,
    allowanceHRA: 150000,
    basicSalary: 500000,
    rentPaid: 120000,
    isMetro: false,
    businessIncome: 0,
    businessExpenses: 0,
    capitalGainsShort: 0,
    capitalGainsLong: 0,
    otherInterest: 8000,
    otherDividend: 3000,
    cryptoIncome: 0,
    foreignIncome: 0
  });

  const [deductions, setDeductions] = useState<ClaimedDeductions>({
    section80C: 100000,
    section80D_self: 15000,
    isSelfSenior: false,
    section80D_parents: 0,
    areParentsSenior: false,
    section80CCD_1B: 0,
    section80TTA: 4000,
    section24B_homeLoan: 0,
    otherDeductions: 0
  });

  // Apply light/dark theme class on body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Handle Updates
  const handleUpdateIncome = (updates: Partial<IncomeSources>) => {
    setIncome(prev => ({ ...prev, ...updates }));
  };

  const handleUpdateDeductions = (updates: Partial<ClaimedDeductions>) => {
    setDeductions(prev => ({ ...prev, ...updates }));
  };

  const handleImportMockData = (mockIncome: IncomeSources, mockDeds: ClaimedDeductions) => {
    setIncome(mockIncome);
    setDeductions(mockDeds);
    alert('Mock client profiles imported successfully! Calculations re-evaluated.');
  };

  const handleUpdateRules = (newRules: any) => {
    setCustomRules(newRules);
  };

  const handleResetRules = () => {
    setCustomRules(null);
  };

  // Perform tax calculations dynamically in real-time
  let calcResult: CalculationResult;
  try {
    calcResult = calculateTax(assessmentYear, income, deductions, customRules);
  } catch (err) {
    console.error(err);
    // fallback if configuration is broken
    calcResult = calculateTax(assessmentYear, income, deductions);
  }

  // Sidebar Menu mapping based on active role permissions
  const menuItems = [
    { id: 'dashboard', label: 'Compliance Dashboard', icon: FileText, roles: ['taxpayer', 'business', 'ca', 'admin'] },
    { id: 'ca-portal', label: 'CA Client Portal', icon: User, roles: ['ca'] },
    { id: 'optimizer', label: 'Tax regime Optimizer', icon: Sparkles, roles: ['taxpayer', 'business', 'ca'] },
    { id: 'itr', label: 'Income Tax filing (ITR)', icon: CheckSquare, roles: ['taxpayer', 'business', 'ca'] },
    { id: 'gst', label: 'GST module Invoices', icon: Briefcase, roles: ['business', 'ca'] },
    { id: 'bookkeeping', label: 'AI Bookkeeping P&L', icon: Briefcase, roles: ['business', 'ca'] },
    { id: 'loan-center', label: 'Loan EMI & Benefits', icon: Landmark, roles: ['taxpayer', 'business', 'ca'] },
    { id: 'financial-planner', label: 'Financial Health & Goals', icon: Award, roles: ['taxpayer', 'business', 'ca'] },
    { id: 'admin', label: 'Admin Rules Panel', icon: Settings, roles: ['admin'] },
    { id: 'ai-assistant', label: 'AI Chat Assistant', icon: HelpCircle, roles: ['taxpayer', 'business', 'ca', 'admin'] }
  ];

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(activeRole));

  // Redirect to dashboard if the active tab is not visible to the current persona
  useEffect(() => {
    if (!visibleMenuItems.some(m => m.id === activeTab)) {
      setActiveTab('dashboard');
    }
  }, [activeRole]);

  const handleNotificationRead = (id: string) => {
    setNotificationsList(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadNotifications(prev => Math.max(0, prev - 1));
  };

  const markAllNotificationsRead = () => {
    setNotificationsList(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadNotifications(0);
  };

  return (
    <div className="app-container">
      
      {/* SIDEBAR NAVIGATION Panel */}
      <aside className={`sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
        
        {/* Brand Logo */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '8px', 
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-success) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#ffffff'
            }}>T</div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
              TaxWise <span style={{ color: 'var(--accent-success)' }}>AI</span>
            </h1>
          </div>
          {/* Close drawer for mobile view */}
          <button 
            style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }} 
            className="mobile-close-btn"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {visibleMenuItems.map(item => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileSidebarOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'all 0.2s',
                  width: '100%'
                }}
                className="sidebar-btn"
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer info: Disclaimer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <div>© 2026 TaxWise Compliance.</div>
          <div style={{ marginTop: '4px' }}>Assisted filings do not constitute professional advice unless certified.</div>
        </div>

      </aside>

      {/* MAIN FRAME CONTENT AREA */}
      <main className="main-content">
        
        {/* TOP HEADER */}
        <header className="main-header">
          
          {/* Hamburger (Mobile) */}
          <button 
            style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
            className="mobile-menu-btn"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* Page Title Context */}
          <div style={{ marginRight: 'auto' }} className="header-title-section">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              {visibleMenuItems.find(m => m.id === activeTab)?.label || 'Overview'}
            </h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Compliance Portal • Tax rules configured for Assessment Year <strong>{assessmentYear}</strong>
            </div>
          </div>

          {/* Configuration controls & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="header-controls-section">
            
            {/* Assessment Year Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Filing AY:</span>
              <select 
                value={assessmentYear} 
                onChange={(e: any) => setAssessmentYear(e.target.value)}
                style={{ width: '130px', padding: '6px 10px', fontSize: '0.8rem' }}
              >
                <option value="AY-2025-26">AY 2025-26</option>
                <option value="AY-2024-25">AY 2024-25</option>
              </select>
            </div>

            {/* Persona / Role Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Role:</span>
              <select 
                value={activeRole} 
                onChange={(e: any) => setActiveRole(e.target.value)}
                style={{ width: '170px', padding: '6px 10px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)' }}
              >
                <option value="taxpayer">Individual (Salaried)</option>
                <option value="business">Freelancer / Business</option>
                <option value="ca">Chartered Accountant (CA)</option>
                <option value="admin">Platform Admin</option>
              </select>
            </div>

            {/* Notifications Alert Bell */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifications(prev => !prev)}
                style={{
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                  borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'var(--text-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <Bell size={16} />
                {unreadNotifications > 0 && (
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    backgroundColor: 'var(--accent-danger)', color: '#ffffff',
                    fontSize: '0.65rem', fontWeight: 'bold', width: '16px', height: '16px',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Drawer */}
              {showNotifications && (
                <div style={{
                  position: 'absolute', top: '44px', right: 0,
                  width: '320px', backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)', borderRadius: '12px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.5)', zIndex: 500,
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Compliance Alerts</span>
                    <button style={{ fontSize: '0.75rem', background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }} onClick={markAllNotificationsRead}>
                      Mark all read
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '250px', overflowY: 'auto' }}>
                    {notificationsList.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => handleNotificationRead(item.id)}
                        style={{
                          padding: '12px 16px', borderBottom: '1px solid var(--border-color)',
                          backgroundColor: item.read ? 'transparent' : 'rgba(99, 102, 241, 0.04)',
                          cursor: 'pointer', display: 'flex', gap: '10px'
                        }}
                      >
                        <Calendar size={14} style={{ color: item.read ? 'var(--text-muted)' : 'var(--accent-primary)', marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: item.read ? 400 : 600, color: 'var(--text-primary)' }}>{item.title}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{item.desc}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>{item.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Light/Dark Toggle */}
            <button 
              onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              style={{
                background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'var(--text-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

          </div>
        </header>

        {/* MAIN BODY CONTENT WRAPPER */}
        <div style={{ flex: 1 }}>
          
          {/* Active Tab Router */}
          {activeTab === 'dashboard' && (
            <Dashboard 
              income={income} 
              deductions={deductions} 
              calcResult={calcResult}
              assessmentYear={assessmentYear}
              activeRole={activeRole}
              onImportMockData={handleImportMockData}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'ca-portal' && activeRole === 'ca' && <CAPortal />}

          {activeTab === 'optimizer' && (
            <TaxOptimizer 
              income={income} 
              deductions={deductions} 
              calcResult={calcResult}
              assessmentYear={assessmentYear}
              onUpdateIncome={handleUpdateIncome}
              onUpdateDeductions={handleUpdateDeductions}
            />
          )}

          {activeTab === 'itr' && (
            <ITRFiling 
              income={income} 
              deductions={deductions} 
              calcResult={calcResult}
              assessmentYear={assessmentYear}
              onImportMockData={handleImportMockData}
            />
          )}

          {activeTab === 'gst' && (activeRole === 'business' || activeRole === 'ca') && <GSTModule />}

          {activeTab === 'bookkeeping' && (activeRole === 'business' || activeRole === 'ca') && <Bookkeeping />}

          {activeTab === 'loan-center' && (
            <LoanCenter 
              income={income} 
              deductions={deductions} 
              calcResult={calcResult}
              onUpdateDeductions={handleUpdateDeductions}
            />
          )}

          {activeTab === 'financial-planner' && (
            <FinancialPlanner 
              income={income} 
              deductions={deductions} 
            />
          )}

          {activeTab === 'admin' && activeRole === 'admin' && (
            <AdminPanel 
              assessmentYear={assessmentYear}
              customRules={customRules}
              onUpdateRules={handleUpdateRules}
              onResetRules={handleResetRules}
            />
          )}

          {activeTab === 'ai-assistant' && (
            <AIAssistant 
              income={income} 
              deductions={deductions} 
              calcResult={calcResult}
              assessmentYear={assessmentYear}
            />
          )}

        </div>

      </main>

      {/* Mobile Drawer Styles & Media Query Overrides */}
      <style>{`
        @media (max-width: 1024px) {
          .mobile-menu-btn {
            display: flex !important;
          }
          .mobile-close-btn {
            display: block !important;
          }
          .header-title-section {
            margin-left: 12px;
          }
        }
        @media (max-width: 768px) {
          .header-controls-section {
            gap: 8px !important;
          }
          .header-controls-section select {
            width: 120px !important;
          }
          .grid-responsive-dashboard {
            grid-template-columns: 1fr !important;
          }
          .grid-responsive-optimizer {
            grid-template-columns: 1fr !important;
          }
          .grid-responsive-fields {
            grid-template-columns: 1fr !important;
          }
          .grid-responsive-itr {
            grid-template-columns: 1fr !important;
          }
          .grid-responsive-gst {
            grid-template-columns: 1fr !important;
          }
          .grid-responsive-bookkeeping {
            grid-template-columns: 1fr !important;
          }
          .grid-responsive-ca {
            grid-template-columns: 1fr !important;
          }
          .grid-responsive-loans {
            grid-template-columns: 1fr !important;
          }
          .grid-responsive-planner {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}
