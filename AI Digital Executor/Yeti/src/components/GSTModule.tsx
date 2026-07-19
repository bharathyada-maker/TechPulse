import { useState } from 'react';
import { 
  FileSpreadsheet, Plus, Trash2, Printer, Percent, CheckCircle
} from 'lucide-react';

interface InvoiceItem {
  description: string;
  qty: number;
  rate: number;
  gstRate: number; // e.g. 5, 12, 18, 28
}

export default function GSTModule() {
  const [clientName, setClientName] = useState('Acme Corp');
  const [clientGst, setClientGst] = useState('27AAAAA1111A1Z1');
  const [invoiceType, setInvoiceType] = useState<'intra' | 'inter'>('intra'); // intra = CGST+SGST, inter = IGST
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: 'Cloud Services Consulting', qty: 1, rate: 75000, gstRate: 18 }
  ]);
  const [invoiceHistory, setInvoiceHistory] = useState<any[]>([]);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);

  // Add Item to Invoice
  const handleAddItem = () => {
    setItems(prev => [...prev, { description: '', qty: 1, rate: 0, gstRate: 18 }]);
  };

  // Remove Item
  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Update Item Fields
  const handleUpdateItem = (index: number, updates: Partial<InvoiceItem>) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item));
  };

  // Computations
  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  const gstDetails = items.map(item => {
    const itemSub = item.qty * item.rate;
    const gstAmt = itemSub * (item.gstRate / 100);
    return {
      subtotal: itemSub,
      gstRate: item.gstRate,
      gstAmt
    };
  });
  const totalGst = gstDetails.reduce((sum, d) => sum + d.gstAmt, 0);
  const grandTotal = subtotal + totalGst;

  // Generate Invoice
  const handleGenerateInvoice = () => {
    const newInv = {
      id: `INV-${Date.now().toString().slice(-6)}`,
      client: clientName,
      gstin: clientGst,
      date: new Date().toLocaleDateString(),
      subtotal,
      gst: totalGst,
      total: grandTotal,
      items
    };
    setInvoiceHistory(prev => [newInv, ...prev]);
    setShowInvoicePreview(true);
  };

  // Input Tax Credit Mock Calculations
  const salesGstLiability = subtotal > 0 ? totalGst : 135000;
  const purchasesItc = 92000;
  const netGstPayable = Math.max(0, salesGstLiability - purchasesItc);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1.3fr', gap: '24px' }} className="grid-responsive-gst">
      
      {/* Left Column: Invoice Creator */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <FileSpreadsheet size={20} style={{ color: 'var(--accent-primary)' }} />
          GST B2B Compliance Invoice Generator
        </h3>

        {/* Client Metadata */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr', gap: '16px' }} className="grid-responsive-fields">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Client Company Name</label>
            <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Client GSTIN</label>
            <input type="text" value={clientGst} onChange={(e) => setClientGst(e.target.value)} placeholder="e.g. 27AAAAA1111A1Z1" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Transaction Type</label>
            <select value={invoiceType} onChange={(e) => setInvoiceType(e.target.value as any)}>
              <option value="intra">Intrastate (CGST+SGST)</option>
              <option value="inter">Interstate (IGST)</option>
            </select>
          </div>
        </div>

        {/* Invoice Item list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Invoice Line Items</span>
          
          {items.map((item, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 0.6fr 1fr 0.8fr auto', gap: '12px', alignItems: 'center' }} className="grid-responsive-itemrow">
              <input 
                type="text" 
                placeholder="Item / service description" 
                value={item.description}
                onChange={(e) => handleUpdateItem(index, { description: e.target.value })}
              />
              <input 
                type="number" 
                placeholder="Qty" 
                value={item.qty}
                onChange={(e) => handleUpdateItem(index, { qty: parseFloat(e.target.value) || 0 })}
              />
              <input 
                type="number" 
                placeholder="Rate (₹)" 
                value={item.rate}
                onChange={(e) => handleUpdateItem(index, { rate: parseFloat(e.target.value) || 0 })}
              />
              <select 
                value={item.gstRate} 
                onChange={(e) => handleUpdateItem(index, { gstRate: parseInt(e.target.value) })}
              >
                <option value={5}>5% GST</option>
                <option value={12}>12% GST</option>
                <option value={18}>18% GST</option>
                <option value={28}>28% GST</option>
              </select>
              <button 
                className="btn btn-outline" 
                style={{ padding: '8px', color: 'var(--accent-danger)' }}
                onClick={() => handleRemoveItem(index)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <button className="btn btn-outline" style={{ alignSelf: 'flex-start', fontSize: '0.8rem' }} onClick={handleAddItem}>
            <Plus size={14} /> Add Line Item
          </button>
        </div>

        {/* Summary Calc & Actions */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Subtotal: ₹{subtotal.toLocaleString()}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {invoiceType === 'intra' 
                ? `CGST (${(totalGst/2).toLocaleString()}) + SGST (${(totalGst/2).toLocaleString()})`
                : `IGST: ₹${totalGst.toLocaleString()}`
              }
            </span>
            <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Grand Total: ₹{grandTotal.toLocaleString()}</strong>
          </div>
          <button className="btn btn-primary" onClick={handleGenerateInvoice}>
            Generate Compliance Invoice
          </button>
        </div>

      </div>

      {/* Right Column: Return Tracking & ITC Calculator */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Input Tax Credit (ITC) matching ledger */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Input Tax Credit (ITC) Matching</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Sales GST Liability (GSTR-1)</span>
              <strong>₹{salesGstLiability.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Purchases ITC Mapped (GSTR-2B)</span>
              <strong style={{ color: 'var(--accent-success)' }}>- ₹{purchasesItc.toLocaleString()}</strong>
            </div>
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 700 }}>
              <span>Net GST Payable (GSTR-3B)</span>
              <span style={{ color: netGstPayable > 0 ? 'var(--accent-warning)' : 'var(--accent-success)' }}>
                ₹{netGstPayable.toLocaleString()}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              <Percent size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
              <span>
                Our matcher compared GSTR-2B vendor uploads and mapped 98.5% matching accuracy. ₹4,500 unclaimed credit is eligible for carry-forward.
              </span>
            </div>
          </div>
        </div>

        {/* Invoice preview overlay */}
        {showInvoicePreview && invoiceHistory.length > 0 && (
          <div className="glass-panel" style={{ padding: '20px', border: '1px solid var(--accent-success)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={14} /> Created: {invoiceHistory[0].id}
              </span>
              <button className="btn btn-outline" style={{ padding: '2px 8px', fontSize: '0.75rem' }} onClick={() => setShowInvoicePreview(false)}>Dismiss</button>
            </div>
            
            <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'monospace', fontSize: '0.75rem', lineHeight: '1.4', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)' }}>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '8px' }}>TAXWISE COMPLIANCE INVOICE</div>
              <div>Invoice No: {invoiceHistory[0].id}</div>
              <div>Date: {invoiceHistory[0].date}</div>
              <div>Client: {invoiceHistory[0].client}</div>
              <div>GSTIN: {invoiceHistory[0].gstin}</div>
              <div style={{ borderBottom: '1px dashed #0f172a', margin: '6px 0' }}></div>
              {invoiceHistory[0].items.map((it: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{it.description} (x{it.qty})</span>
                  <span>₹{(it.qty * it.rate).toLocaleString()} ({it.gstRate}%)</span>
                </div>
              ))}
              <div style={{ borderBottom: '1px dashed #0f172a', margin: '6px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span>₹{invoiceHistory[0].subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>GST Tax</span>
                <span>₹{invoiceHistory[0].gst.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>Total Due</span>
                <span>₹{invoiceHistory[0].total.toLocaleString()}</span>
              </div>
            </div>

            <button className="btn btn-success" style={{ width: '100%', fontSize: '0.8rem', padding: '6px 12px', marginTop: '12px' }} onClick={() => window.print()}>
              <Printer size={14} /> Print / Save E-Invoice
            </button>
          </div>
        )}

        {/* GST Filing Calendar Status */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>GST Filing Calendar</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', fontSize: '0.85rem' }}>
              <div>
                <strong>GSTR-1 (Outward Sales)</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Due date: July 11, 2026</div>
              </div>
              <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', fontWeight: 600 }}>Unfiled</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', fontSize: '0.85rem' }}>
              <div>
                <strong>GSTR-3B (Net Payment Summary)</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Due date: July 20, 2026</div>
              </div>
              <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Upcoming</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', fontSize: '0.85rem' }}>
              <div>
                <strong>GSTR-9 (Annual Return)</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Filed: Dec 28, 2025</div>
              </div>
              <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', fontWeight: 600 }}>Filed</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
