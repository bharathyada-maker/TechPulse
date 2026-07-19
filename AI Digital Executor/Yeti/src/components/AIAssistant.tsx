import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import type { IncomeSources, ClaimedDeductions, CalculationResult } from '../utils/taxCalculator';

interface AIAssistantProps {
  income: IncomeSources;
  deductions: ClaimedDeductions;
  calcResult: CalculationResult;
  assessmentYear: string;
}

interface Message {
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

export default function AIAssistant({
  income,
  deductions,
  calcResult,
  assessmentYear
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Hello! I am your TaxWise AI Assistant. Ask me anything about the Indian Income Tax Act, tax exemptions, or how to optimize your filing. I am using the live tax rules configured for **" + assessmentYear + "**. What can I help you with today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const faqSuggestions = [
    "Should I choose New or Old Regime?",
    "How is my HRA exemption calculated?",
    "Explain Section 80D (Health Insurance) limits.",
    "What deductions am I missing to save more tax?",
    "What is the Section 87A rebate rule?"
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Append user message
    const userMsg: Message = { sender: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Process Bot response
    setTimeout(() => {
      const botResponse = getBotResponse(text.toLowerCase());
      const botMsg: Message = { sender: 'bot', text: botResponse, timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
    }, 800);
  };

  const getBotResponse = (query: string): string => {
    // 1. Regime Choice
    if (query.includes('regime') || query.includes('new or old') || query.includes('old or new')) {
      const savings = Math.round(calcResult.taxSavings);
      const optimalName = calcResult.optimalRegime === 'newRegime' ? 'New Tax Regime' : 'Old Tax Regime';
      const standardDedLimit = calcResult.optimalRegime === 'newRegime' ? '₹75,000' : '₹50,000';
      
      return `Based on your current workspace inputs (Gross Income: ₹${calcResult.oldRegime.grossIncome.toLocaleString()}, Deductions: ₹${calcResult.oldRegime.totalDeductions.toLocaleString()}):
      
* **Optimal Selection**: **${optimalName}**
* **Direct Savings**: You save **₹${savings.toLocaleString()}** by choosing this regime.
* **Standard Deduction**: Under the ${calcResult.optimalRegime === 'newRegime' ? 'New' : 'Old'} Regime, you receive a standard deduction of **${standardDedLimit}**.
* **Key Difference**: The New Regime has lower slab rates (5% to 30%) but disallows exemptions (like HRA, 80C, 80D, 24b). The Old Regime permits these deductions but has higher slab rates.

*Note: Sourced from rules versioned for ${assessmentYear}.*`;
    }

    // 2. HRA
    if (query.includes('hra') || query.includes('rent') || query.includes('house rent')) {
      const basic = income.basicSalary > 0 ? income.basicSalary : income.salary * 0.5;
      const rentPaid = income.rentPaid;
      const allowance = income.allowanceHRA;
      const calculatedExemp = calcResult.oldRegime.hraExemption;

      return `Under **Section 10(13A)** of the Income Tax Act, your HRA Exemption (only applicable in the Old Regime) is the **minimum** of the following three values:

1. **Actual HRA received**: ₹${allowance.toLocaleString()}
2. **Rent Paid - 10% of Basic Salary**: ₹${Math.max(0, rentPaid - (basic * 0.1)).toLocaleString()} (Rent: ₹${rentPaid.toLocaleString()}, Basic: ₹${basic.toLocaleString()})
3. **50% of Basic (Metro)** or **40% of Basic (Non-Metro)**: ₹${Math.round(basic * (income.isMetro ? 0.5 : 0.4)).toLocaleString()} (Currently set as: ${income.isMetro ? 'Metro' : 'Non-Metro'})

**Your Allowed HRA Exemption**: **₹${calculatedExemp.toLocaleString()}**
*Tip: To maximize this, you can structure your CTC to increase the basic salary component or declare actual rent paid.*`;
    }

    // 3. Section 80D
    if (query.includes('80d') || query.includes('health insurance') || query.includes('medical')) {
      return `Under **Section 80D**, you can claim deductions for health insurance premiums paid for self, family, and parents:

* **Self, Spouse & Children**: Up to **₹25,000** (increases to **₹50,000** if any member is a Senior Citizen).
* **Parents**: Additional deduction up to **₹25,000** (increases to **₹50,000** if parents are Senior Citizens).
* **Preventive Health Checkup**: A sub-limit of **₹5,000** is allowed within the above caps.

**Your current claims**:
* Self/Family Claim: ₹${deductions.section80D_self.toLocaleString()} (${deductions.isSelfSenior ? 'Senior' : 'Non-Senior'})
* Parents Claim: ₹${deductions.section80D_parents.toLocaleString()} (${deductions.areParentsSenior ? 'Senior' : 'Non-Senior'})
* Total claimed under 80D: ₹${(Math.min(deductions.section80D_self, deductions.isSelfSenior ? 50000 : 25000) + Math.min(deductions.section80D_parents, deductions.areParentsSenior ? 50000 : 25000)).toLocaleString()}`;
    }

    // 4. Missing deductions / Save more tax
    if (query.includes('missing') || query.includes('save more') || query.includes('reduce my tax') || query.includes('optimize')) {
      if (calcResult.optimalRegime === 'newRegime') {
        return `You are currently optimal under the **New Tax Regime**. Because the New Regime disallows deductions, there are no further 80C or 80D adjustments that will reduce your tax liability. 

However, you can explore:
* **Employer NPS Contribution (Section 80CCD(2))**: Up to 10% of your salary contributed by your employer is tax-exempt even under the New Regime!
* **Tax-Free Income**: Dividends (taxed as normal income) and Capital Gains (LTCG holds ₹1.25L exemption threshold in the new rules).`;
      } else {
        const potential80C = 150000 - deductions.section80C;
        const potentialNps = 50000 - deductions.section80CCD_1B;
        let tips = [];
        if (potential80C > 0) tips.push(`* **Section 80C**: Invest ₹${potential80C.toLocaleString()} more in PPF, ELSS, or EPF to save up to ₹${Math.round(potential80C * 0.312).toLocaleString()} in tax.`);
        if (potentialNps > 0) tips.push(`* **NPS (Sec 80CCD(1B))**: Open an NPS tier-1 account and invest ₹${potentialNps.toLocaleString()} more to save up to ₹${Math.round(potentialNps * 0.312).toLocaleString()} in tax.`);
        if (deductions.section24B_homeLoan === 0) tips.push(`* **Home Loan (Sec 24(b))**: If you have a home loan, declaring interest paid (up to ₹2,00,000) can save you up to ₹62,400 in tax.`);
        
        if (tips.length === 0) {
          return `Awesome! You have already maximized all primary deductions (80C, 80D, NPS, and Home Loan interest). There are no additional standard deductions to claim under the Old Regime.`;
        }
        return `Here are your tax-saving opportunities under the **Old Regime**:\n\n${tips.join('\n')}`;
      }
    }

    // 5. Section 87A rebate
    if (query.includes('87a') || query.includes('rebate')) {
      return `**Section 87A** provides a tax rebate to low and middle-income individual taxpayers:

* **Old Regime**: Available if taxable income is ≤ **₹5,00,000**. The rebate is up to **₹12,500** (making tax ₹0).
* **New Regime**: Available if taxable income is ≤ **₹7,00,000**. The rebate is up to **₹25,000** (making tax ₹0).
* *Note*: If your taxable income exceeds these thresholds by even ₹1, the rebate is completely lost and you must pay full slab-wise tax (subject to marginal relief in some cases).

Your taxable income in Old Regime: ₹${calcResult.oldRegime.taxableIncome.toLocaleString()} (Rebate: ₹${calcResult.oldRegime.rebate87A.toLocaleString()})
Your taxable income in New Regime: ₹${calcResult.newRegime.taxableIncome.toLocaleString()} (Rebate: ₹${calcResult.newRegime.rebate87A.toLocaleString()})`;
    }

    // 6. Section 80C list
    if (query.includes('80c') || query.includes('ppf') || query.includes('elss')) {
      return `**Section 80C** is the most popular deduction under the Old Regime with a maximum limit of **₹1,50,000** per year. Eligible investments include:

1. **Provident Funds**: Employee Provident Fund (EPF) and Public Provident Fund (PPF).
2. **Equity Linked Savings Schemes (ELSS)**: Mutual funds with a 3-year lock-in.
3. **National Savings Certificate (NSC)** & Tax Saving FDs (5-year lock-in).
4. **Life Insurance Premium**: Paid for self, spouse, or children.
5. **Home Loan Principal Repayment**: Component of home loan EMI.
6. **Children's School Tuition Fees**: Paid to any school/college in India.

*Note: None of these deductions are allowed if you file under the New Tax Regime.*`;
    }

    // Default response
    return `Interesting question! Regarding that topic, my rule engine is configured to check CBDT guidelines for **${assessmentYear}**.

Here are some quick areas I can assist you with:
* Comparing **New vs Old Regime** slabs.
* Explaining **HRA Exemption** calculations.
* Highlighting limits for **Section 80C, 80D, 80CCD (NPS)**.
* Estimating taxes on **capital gains** or **business income**.

*Disclaimer: TaxWise AI provides software-assisted compliance guidance. This is not formal legal or chartered accountancy advice.*`;
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '600px' }}>
      
      {/* Bot Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ padding: '10px', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)' }}>
          <Bot size={24} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            TaxWise AI Assistant
            <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--accent-success)', color: '#ffffff', fontWeight: 600 }}>RAG Engine</span>
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Ruleset version: {assessmentYear} • CBDT schema v1.0
          </p>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((msg, i) => (
          <div 
            key={i} 
            style={{ 
              display: 'flex', 
              gap: '12px', 
              maxWidth: '85%',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
            }}
          >
            <div style={{ 
              padding: '8px', 
              borderRadius: '50%', 
              backgroundColor: msg.sender === 'user' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
              color: msg.sender === 'user' ? 'var(--accent-primary)' : 'var(--accent-success)',
              height: 'fit-content'
            }}>
              {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div style={{ 
              padding: '12px 16px', 
              borderRadius: '12px', 
              backgroundColor: msg.sender === 'user' ? 'var(--accent-primary)' : 'var(--bg-secondary)', 
              color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
              fontSize: '0.9rem',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>

      {/* Suggestions Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '12px 0', borderTop: '1px solid var(--border-color)', flexShrink: 0 }}>
        {faqSuggestions.map((faq, i) => (
          <button 
            key={i} 
            className="btn btn-outline" 
            style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '20px', whiteSpace: 'nowrap' }}
            onClick={() => handleSend(faq)}
          >
            {faq}
          </button>
        ))}
      </div>

      {/* Chat input box */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
        <input 
          type="text" 
          placeholder="Ask about Section 80C, HRA, Old vs New Regime, etc..." 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(inputValue); }}
          style={{ flex: 1 }}
        />
        <button 
          className="btn btn-primary" 
          style={{ padding: '10px' }}
          onClick={() => handleSend(inputValue)}
        >
          <Send size={18} />
        </button>
      </div>

    </div>
  );
}
