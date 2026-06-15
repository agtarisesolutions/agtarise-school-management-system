import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Search, Download, X, Printer, Trash2 } from 'lucide-react';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

const FEE_ITEMS = [
  { key: 'tuition', label: 'School Fees / Tuition' },
  { key: 'sport', label: 'Sport Fees' },
  { key: 'uniform', label: 'Uniform Fees' },
  { key: 'stationery', label: 'Stationery Fees' },
  { key: 'pta', label: 'PTA Fees' },
  { key: 'exam', label: 'Exam Fees' },
  { key: 'library', label: 'Library Fees' },
  { key: 'development', label: 'Development Levy' },
  { key: 'other', label: 'Other' },
];

const DEFAULT_FORM = {
  studentName: '', studentId: '', studentClass: '', term: 'First Term',
  session: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
  paymentDate: new Date().toISOString().split('T')[0],
  paymentMethod: 'Cash',
  tuition: '', sport: '', uniform: '', stationery: '',
  pta: '', exam: '', library: '', development: '', other: '',
  otherDescription: '',
};

const Receipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [receiptSnap, studentSnap] = await Promise.all([
        getDocs(query(collection(db, 'receipts'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'students')),
      ]);
      setReceipts(receiptSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setStudents(studentSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error fetching receipts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStudentSelect = (e) => {
    const sid = e.target.value;
    const stu = students.find(s => s.studentId === sid || s.id === sid);
    if (stu) {
      setFormData(prev => ({ ...prev, studentId: stu.studentId || stu.id, studentName: stu.name, studentClass: stu.class }));
    } else {
      setFormData(prev => ({ ...prev, studentId: sid }));
    }
  };

  const getTotalAmount = (data = formData) => {
    return FEE_ITEMS.reduce((sum, item) => sum + (parseFloat(data[item.key]) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const total = getTotalAmount();
    const receiptNum = `RCT-${Date.now()}`;
    try {
      await addDoc(collection(db, 'receipts'), {
        ...formData, total, receiptNumber: receiptNum,
        createdAt: new Date().toISOString(),
      });
      setShowModal(false);
      setFormData(DEFAULT_FORM);
      fetchData();
    } catch (err) {
      console.error('Error saving receipt:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this receipt?')) {
      await deleteDoc(doc(db, 'receipts', id));
      fetchData();
    }
  };

  const printReceipt = (receipt) => {
    const feeRows = FEE_ITEMS.filter(item => receipt[item.key] && parseFloat(receipt[item.key]) > 0)
      .map(item => `<tr><td>${item.label}${item.key === 'other' && receipt.otherDescription ? ` (${receipt.otherDescription})` : ''}</td><td style="text-align:right">₦${parseFloat(receipt[item.key]).toLocaleString()}</td></tr>`)
      .join('');

    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Receipt - ${receipt.receiptNumber}</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1e293b; max-width: 600px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 20px; }
        .header h1 { color: #4f46e5; margin: 0; font-size: 24px; }
        .header p { color: #64748b; margin: 5px 0 0; }
        .receipt-meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; background: #f8fafc; padding: 12px; border-radius: 8px; }
        .student-info { margin-bottom: 20px; font-size: 14px; }
        .student-info strong { color: #4f46e5; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th { background: #f1f5f9; text-align: left; padding: 10px 12px; font-size: 13px; border-bottom: 2px solid #cbd5e1; }
        td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
        .total-row td { font-weight: 700; font-size: 16px; background: #f0f4ff; color: #4f46e5; border-top: 2px solid #6366f1; }
        .footer { text-align: center; margin-top: 30px; color: #94a3b8; font-size: 12px; border-top: 1px dashed #cbd5e1; padding-top: 16px; }
        .stamp { display: inline-block; border: 2px solid #10b981; color: #10b981; padding: 6px 16px; border-radius: 4px; font-weight: 700; font-size: 18px; transform: rotate(-10deg); margin-top: 10px; }
      </style></head><body>
      <div class="header"><h1>🏫 Agtarise Solutions School</h1><p>Official Fee Receipt</p></div>
      <div class="receipt-meta">
        <div><strong>Receipt No:</strong> ${receipt.receiptNumber}</div>
        <div><strong>Date:</strong> ${receipt.paymentDate}</div>
        <div><strong>Method:</strong> ${receipt.paymentMethod}</div>
      </div>
      <div class="student-info">
        <strong>Student Name:</strong> ${receipt.studentName} &nbsp;|&nbsp;
        <strong>ID:</strong> ${receipt.studentId} &nbsp;|&nbsp;
        <strong>Class:</strong> ${receipt.studentClass}<br/>
        <strong>Term:</strong> ${receipt.term} &nbsp;|&nbsp; <strong>Session:</strong> ${receipt.session}
      </div>
      <table><thead><tr><th>Description</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>${feeRows}
      <tr class="total-row"><td>TOTAL PAID</td><td style="text-align:right">₦${receipt.total.toLocaleString()}</td></tr>
      </tbody></table>
      <div style="text-align:center"><div class="stamp">PAID ✓</div></div>
      <div class="footer"><p>Thank you for your payment. This is a computer-generated receipt.</p><p>© ${new Date().getFullYear()} Agtarise Solutions. All rights reserved.</p></div>
      <script>window.onload = function(){ window.print(); setTimeout(()=>window.close(), 500); }</script>
      </body></html>`);
    win.document.close();
  };

  const filtered = receipts.filter(r =>
    (r.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.studentId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.receiptNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputStyle = { width: '100%', padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' };
  const labelStyle = { display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Student <span className="text-gradient">Receipts</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Issue and manage payment receipts for all school fees.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} /> Issue New Receipt
        </button>
      </div>

      <div style={{ position: 'relative', maxWidth: '400px' }}>
        <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
        <input type="text" placeholder="Search by name, ID or receipt no..." value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.2rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }} />
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading receipts...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <Receipt size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.4 }} />
              <p style={{ color: 'var(--text-muted)' }}>No receipts found. Issue your first receipt above.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '1rem' }}>Receipt No.</th>
                  <th style={{ padding: '1rem' }}>Student</th>
                  <th style={{ padding: '1rem' }}>Class</th>
                  <th style={{ padding: '1rem' }}>Term / Session</th>
                  <th style={{ padding: '1rem' }}>Date</th>
                  <th style={{ padding: '1rem' }}>Total (₦)</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1rem', color: 'var(--primary-color)', fontWeight: '600', fontSize: '0.85rem' }}>{r.receiptNumber}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '500' }}>{r.studentName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.studentId}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>{r.studentClass}</td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                      <div>{r.term}</div>
                      <div style={{ color: 'var(--text-muted)' }}>{r.session}</div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{r.paymentDate}</td>
                    <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--success)' }}>₦{(r.total || 0).toLocaleString()}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button onClick={() => printReceipt(r)} style={{ padding: '0.4rem 0.8rem', background: 'var(--primary-color)', border: 'none', borderRadius: '4px', color: 'white', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Printer size={14} /> Print
                        </button>
                        <button onClick={() => handleDelete(r.id)} style={{ padding: '0.4rem 0.6rem', background: 'rgba(239,68,68,0.1)', border: '1px solid var(--error)', borderRadius: '4px', color: 'var(--error)', fontSize: '0.75rem', cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '650px', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Issue New <span className="text-gradient">Receipt</span></h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Select Student (or type name manually)</label>
                  <select onChange={handleStudentSelect} style={inputStyle} defaultValue="">
                    <option value="">— Select from registry —</option>
                    {students.map(s => <option key={s.id} value={s.studentId || s.id}>{s.name} ({s.class})</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Student Name</label>
                  <input required type="text" value={formData.studentName} onChange={e => setFormData(p => ({ ...p, studentName: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Student ID</label>
                  <input type="text" value={formData.studentId} onChange={e => setFormData(p => ({ ...p, studentId: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Class</label>
                  <input type="text" value={formData.studentClass} onChange={e => setFormData(p => ({ ...p, studentClass: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Term</label>
                  <select value={formData.term} onChange={e => setFormData(p => ({ ...p, term: e.target.value }))} style={inputStyle}>
                    <option>First Term</option>
                    <option>Second Term</option>
                    <option>Third Term</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Session</label>
                  <input type="text" value={formData.session} onChange={e => setFormData(p => ({ ...p, session: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Payment Date</label>
                  <input type="date" value={formData.paymentDate} onChange={e => setFormData(p => ({ ...p, paymentDate: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Payment Method</label>
                  <select value={formData.paymentMethod} onChange={e => setFormData(p => ({ ...p, paymentMethod: e.target.value }))} style={inputStyle}>
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                    <option>POS</option>
                    <option>Cheque</option>
                  </select>
                </div>
              </div>

              <h3 style={{ fontSize: '1rem', color: 'var(--primary-color)', marginBottom: '1rem' }}>Fee Breakdown</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                {FEE_ITEMS.map(item => (
                  <div key={item.key}>
                    <label style={labelStyle}>{item.label} (₦)</label>
                    <input type="number" min="0" value={formData[item.key]} onChange={e => setFormData(p => ({ ...p, [item.key]: e.target.value }))} placeholder="0.00" style={inputStyle} />
                    {item.key === 'other' && (
                      <input type="text" value={formData.otherDescription} onChange={e => setFormData(p => ({ ...p, otherDescription: e.target.value }))} placeholder="Describe other fee..." style={{ ...inputStyle, marginTop: '0.35rem' }} />
                    )}
                  </div>
                ))}
              </div>

              <div style={{ padding: '1rem', background: 'rgba(99,102,241,0.1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-color)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '600', fontSize: '1rem' }}>Total Amount:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-color)' }}>₦{getTotalAmount().toLocaleString()}</span>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
                <Receipt size={20} /> Save & Issue Receipt
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Receipts;
