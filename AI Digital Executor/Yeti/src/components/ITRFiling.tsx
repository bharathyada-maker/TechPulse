import { useState, useRef } from 'react';
import { 
  UploadCloud, ChevronRight, ChevronLeft, CheckCircle, 
  AlertTriangle, ShieldCheck, Download, Check, RefreshCw
} from 'lucide-react';
import type { IncomeSources, ClaimedDeductions, CalculationResult } from '../utils/taxCalculator';

interface ITRFilingProps {
  income: IncomeSources;
  deductions: ClaimedDeductions;
  calcResult: CalculationResult;
  assessmentYear: string;
  onImportMockData: (mockIncome: IncomeSources, mockDeductions: ClaimedDeductions) => void;
}

export default function ITRFiling({
  income,
  deductions: _deductions,
  calcResult,
  assessmentYear,
  onImportMockData
}: ITRFilingProps) {
  const [step, setStep] = useState<number>(1);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanResult, setScanResult] = useState<string>('');
  const [isAadhaarVerified, setIsAadhaarVerified] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [selectedRegime, setSelectedRegime] = useState<'oldRegime' | 'newRegime' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.json')) {
      setIsScanning(true);
      setScanProgress(0);
      setScanResult('');
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.income && data.deductions) {
            let progress = 0;
            const interval = setInterval(() => {
              progress += 20;
              setScanProgress(progress);
              if (progress >= 100) {
                clearInterval(interval);
                setIsScanning(false);
                const now = new Date();
                const formattedDate = now.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                });
                setScanResult(`Real profile "${file.name}" parsed & imported successfully on ${formattedDate}`);
                onImportMockData(data.income, data.deductions);
              }
            }, 300);
          } else {
            setIsScanning(false);
            alert('Invalid profile JSON structure. Must contain "income" and "deductions" keys.');
          }
        } catch (err) {
          setIsScanning(false);
          alert('Error parsing JSON profile.');
        }
      };
      reader.readAsText(file);
    } else {
      triggerFileScan(file.name);
    }
  };

  const activeRegime = selectedRegime || calcResult.optimalRegime;
  const activeData = calcResult[activeRegime];

  // Auto-determine ITR Form
  const determineITRForm = () => {
    if (income.businessIncome > 0) {
      // If using presumptive tax (e.g. business income but let's assume ITR-3 for normal, ITR-4 for simple business)
      if (income.businessIncome <= 2000000) return { code: 'ITR-4', name: 'Sugam', desc: 'Presumptive business & professional income (Sec 44AD/44ADA)' };
      return { code: 'ITR-3', name: 'ITR-3', desc: 'Proprietorship business or professional income' };
    }
    if (income.capitalGainsShort > 0 || income.capitalGainsLong > 0 || income.cryptoIncome > 0 || income.foreignIncome > 0) {
      return { code: 'ITR-2', name: 'ITR-2', desc: 'Capital Gains, Crypto, Foreign Income, or multiple House Properties' };
    }
    // Standard salaried taxpayer
    const totalGross = income.salary + income.otherInterest + income.otherDividend;
    if (totalGross <= 5000000) {
      return { code: 'ITR-1', name: 'Sahaj', desc: 'Salaried individual, one house property, interest income under ₹50 Lakhs' };
    }
    return { code: 'ITR-2', name: 'ITR-2', desc: 'Salaried individual, income exceeds ₹50 Lakhs' };
  };

  const itrForm = determineITRForm();

  // Simulate OCR Scan
  const triggerFileScan = (_fileName: string) => {
    setIsScanning(true);
    setScanProgress(0);
    setScanResult('');

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsScanning(false);
            const now = new Date();
            const formattedDate = now.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
            setScanResult(`Form 16 uploaded and scanned successfully on ${formattedDate}`);
            // Auto fill fields
            onImportMockData({
              salary: 1800000,
              allowanceHRA: 220000,
              basicSalary: 800000,
              rentPaid: 240000,
              isMetro: true,
              businessIncome: 0,
              businessExpenses: 0,
              capitalGainsShort: 15000,
              capitalGainsLong: 30000,
              otherInterest: 12000,
              otherDividend: 5000,
              cryptoIncome: 0,
              foreignIncome: 0
            }, {
              section80C: 150000,
              section80D_self: 25000,
              isSelfSenior: false,
              section80D_parents: 25000,
              areParentsSenior: false,
              section80CCD_1B: 50000,
              section80TTA: 10000,
              section24B_homeLoan: 150000,
              otherDeductions: 0
            });
          }, 6000);
          return 100;
        }
        return prev + 20;
      });
    }, 1000);
  };

  // Simulate Submit Return
  const handleSubmitReturn = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };

  return (
    <div className="glass-panel" style={{ padding: '28px', minHeight: '500px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      
      {/* Wizard Header Progress Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            width: '28px', height: '28px', borderRadius: '50%',
            backgroundColor: step >= 1 ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
            color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.85rem'
          }}>1</span>
          <span style={{ fontSize: '0.85rem', fontWeight: step === 1 ? 600 : 400, color: step === 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}>Income Selection</span>
        </div>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)', margin: '0 16px' }}></div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            width: '28px', height: '28px', borderRadius: '50%',
            backgroundColor: step >= 2 ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
            color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.85rem'
          }}>2</span>
          <span style={{ fontSize: '0.85rem', fontWeight: step === 2 ? 600 : 400, color: step === 2 ? 'var(--text-primary)' : 'var(--text-muted)' }}>Import & Scan</span>
        </div>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)', margin: '0 16px' }}></div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            width: '28px', height: '28px', borderRadius: '50%',
            backgroundColor: step >= 3 ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
            color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.85rem'
          }}>3</span>
          <span style={{ fontSize: '0.85rem', fontWeight: step === 3 ? 600 : 400, color: step === 3 ? 'var(--text-primary)' : 'var(--text-muted)' }}>Tax Calculation</span>
        </div>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)', margin: '0 16px' }}></div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            width: '28px', height: '28px', borderRadius: '50%',
            backgroundColor: step >= 4 ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
            color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.85rem'
          }}>4</span>
          <span style={{ fontSize: '0.85rem', fontWeight: step === 4 ? 600 : 400, color: step === 4 ? 'var(--text-primary)' : 'var(--text-muted)' }}>Verify & File</span>
        </div>
      </div>

      {/* STEP 1: Income Selection */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>Select Your Income Sources</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              We will automatically determine the appropriate ITR form according to CBDT guidelines.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }} className="grid-responsive-itr">
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input type="checkbox" checked={income.salary > 0} onChange={() => {}} readOnly style={{ width: '18px', height: '18px' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>Salaried Income</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Standard Form 16 reporting</span>
              </div>
            </div>
            
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input type="checkbox" checked={income.businessIncome > 0} onChange={() => {}} readOnly style={{ width: '18px', height: '18px' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>Business / Profession</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SME, consulting, or freelancing</span>
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input type="checkbox" checked={income.capitalGainsShort > 0 || income.capitalGainsLong > 0} onChange={() => {}} readOnly style={{ width: '18px', height: '18px' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>Capital Gains</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Stocks, mutual funds, or real estate</span>
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input type="checkbox" checked={income.otherInterest > 0} onChange={() => {}} readOnly style={{ width: '18px', height: '18px' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>Other Sources</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Savings interest, dividends, crypto</span>
              </div>
            </div>
          </div>

          {/* ITR Form Decision Banner */}
          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.1)', display: 'flex', gap: '16px', alignItems: 'center', marginTop: '12px' }}>
            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--accent-primary)', color: '#ffffff', fontWeight: 700, fontSize: '1.2rem' }}>
              {itrForm.code}
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Form {itrForm.code} ({itrForm.name}) Determined</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {itrForm.desc}. We will compile your details under this form schema.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Import & OCR Scan */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>Upload Financial Documents</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Upload your Form 16, Bank statements, or Demat PDFs. Our smart OCR categorizer reads them and structures your returns.
            </p>
          </div>

          {/* Drag & Drop Simulation Panel */}
          <div 
            style={{
              border: '2px dashed var(--border-color)',
              borderRadius: '16px',
              padding: '40px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: 'var(--bg-secondary)',
              transition: 'border-color 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
            onClick={() => fileInputRef.current?.click()}
            className="drag-drop-zone"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }}
              accept=".pdf,.xls,.xlsx,.csv,.json"
            />
            <UploadCloud size={48} style={{ color: 'var(--accent-primary)', marginBottom: '8px' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Drag and Drop your PDF, Excel, or JSON profile here</h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supports Form 16, Form 16A, 26AS, AIS files or custom TaxWise JSON profiles</span>
            <button className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.85rem', marginTop: '12px' }}>
              Select File
            </button>
          </div>

          {/* Scanning animation & status */}
          {isScanning && (
            <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={14} className="spin-animation" style={{ color: 'var(--accent-primary)' }} />
                  AI OCR Scanner processing: Form16_FY24-25.pdf...
                </span>
                <strong>{scanProgress}%</strong>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${scanProgress}%`, height: '100%', backgroundColor: 'var(--accent-primary)', transition: 'width 0.3s' }}></div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {scanProgress < 40 ? 'Extracting text tables...' : scanProgress < 80 ? 'Mapping salary and TDS parameters...' : 'Verifying figures with GST/26AS database...'}
              </span>
            </div>
          )}

          {scanResult && (
            <div className="alert-box alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <CheckCircle size={18} />
                <span><strong>Scan Successful!</strong> Form 16 values mapped: Salary of ₹18,00,000, HRA Allowance ₹2,20,000. Mapped 8 deductions.</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Tax Calculation Worksheet */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>Income Tax Computation Worksheet</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Verify the dynamic calculation steps versioned for {assessmentYear}. All computations are audit-logged.
            </p>
          </div>

          {/* Regime Selector Toggle */}
          <div style={{ display: 'flex', gap: '12px', padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', alignItems: 'center', justifyContent: 'space-between' }} className="grid-responsive-fields">
            <div>
              <strong style={{ fontSize: '0.9rem', display: 'block' }}>Filing Regime Option Selection</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Choose which regime to apply. (✨ denotes mathematically optimal choice based on deductions)
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`btn ${activeRegime === 'newRegime' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                onClick={() => setSelectedRegime('newRegime')}
              >
                New Regime {calcResult.optimalRegime === 'newRegime' && '✨'}
              </button>
              <button 
                className={`btn ${activeRegime === 'oldRegime' ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                onClick={() => setSelectedRegime('oldRegime')}
              >
                Old Regime {calcResult.optimalRegime === 'oldRegime' && '✨'}
              </button>
            </div>
          </div>

          <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Gross Total Income</span>
              <strong style={{ color: 'var(--text-primary)' }}>₹{activeData.grossIncome.toLocaleString()}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Total Exemptions & Deductions</span>
              <strong style={{ color: 'var(--accent-success)' }}>- ₹{activeData.totalDeductions.toLocaleString()}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Net Taxable Income</span>
              <strong style={{ color: 'var(--text-primary)' }}>₹{activeData.taxableIncome.toLocaleString()}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Base Slab Tax ({activeRegime === 'newRegime' ? 'New slabs' : 'Old slabs'})</span>
              <strong style={{ color: 'var(--text-primary)' }}>₹{Math.round(activeData.baseTax).toLocaleString()}</strong>
            </div>

            {activeData.rebate87A > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>Section 87A Rebate</span>
                <strong style={{ color: 'var(--accent-success)' }}>- ₹{activeData.rebate87A.toLocaleString()}</strong>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Education Cess (4%)</span>
              <strong style={{ color: 'var(--text-primary)' }}>₹{Math.round(activeData.cess).toLocaleString()}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, paddingTop: '4px' }}>
              <span>Net Tax Payable</span>
              <span style={{ color: 'var(--accent-primary)' }}>₹{Math.round(activeData.totalTax).toLocaleString()}</span>
            </div>
          </div>

          {/* Audit Logs list */}
          <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              Tax Calculation Steps (Audit Log)
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {calcResult.calculationSteps.map((stepStr, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ color: 'var(--accent-success)' }}>✓</span>
                  <span>{stepStr}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-outline" style={{ fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Download size={14} /> Download Computation Sheet
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Verify & File */}
      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          {!isSubmitted ? (
            <>
              <div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>E-Verify Return using Aadhaar OTP</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Securely authorize submission to the Income Tax Department filing system using E-Verification.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Verify Pan: XXXXX1234X</span>
                  <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', fontWeight: 600 }}>Active</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Aadhaar-Linked Mobile OTP</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input 
                      type="text" 
                      placeholder="Enter 6-digit OTP" 
                      maxLength={6} 
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      style={{ fontSize: '1.1rem', letterSpacing: '0.15em', textAlign: 'center', maxWidth: '200px' }}
                    />
                    <button 
                      className="btn btn-primary" 
                      style={{ fontSize: '0.85rem' }} 
                      disabled={verificationCode.length !== 6}
                      onClick={() => setIsAadhaarVerified(true)}
                    >
                      Verify OTP
                    </button>
                  </div>
                </div>

                {isAadhaarVerified && (
                  <div className="alert-box alert-success" style={{ padding: '10px 14px' }}>
                    <ShieldCheck size={18} />
                    <span><strong>Aadhaar E-Verification Complete.</strong> Ready to submit.</span>
                  </div>
                )}
              </div>

              <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AlertTriangle size={18} style={{ color: 'var(--accent-warning)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Disclaimer: This is a software-assisted compliance preparation tool. Once you click "Submit Return", you certify that the calculated data aligns with your declarations.
                </span>
              </div>

              <button 
                className="btn btn-success" 
                style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 600 }}
                disabled={!isAadhaarVerified || isSubmitting}
                onClick={handleSubmitReturn}
              >
                {isSubmitting ? 'Submitting Return...' : `Submit Return (${itrForm.code})`}
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', flex: 1, justifyContent: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                <Check size={36} style={{ color: 'var(--accent-success)' }} />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>ITR Return Filed Successfully!</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', lineHeight: '1.5' }}>
                Your returns for Assessment Year {assessmentYear} have been submitted to the Income Tax portal. Acknowledgement Number: <strong>ACK892031749</strong>.
              </p>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button className="btn btn-outline" style={{ fontSize: '0.9rem' }} onClick={() => { setStep(1); setIsSubmitted(false); setIsAadhaarVerified(false); setVerificationCode(''); }}>
                  File Another Return
                </button>
                <button className="btn btn-primary" style={{ fontSize: '0.9rem' }} onClick={() => window.print()}>
                  Print Acknowledgement
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons footer */}
      {!isSubmitted && (
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '24px' }}>
          <button 
            className="btn btn-outline" 
            disabled={step === 1} 
            onClick={() => setStep(prev => prev - 1)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          
          {step < 4 ? (
            <button 
              className="btn btn-primary" 
              onClick={() => setStep(prev => prev + 1)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              Next <ChevronRight size={16} />
            </button>
          ) : null}
        </div>
      )}

      <style>{`
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
}
