import React, { useState, useEffect } from 'react';
import { CreditCard, Download, Search, CheckCircle, Clock, Plus, X, Trash2, Edit2, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const Payroll = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newPayroll, setNewPayroll] = useState({
    staffName: '', role: 'Teacher', basicSalary: '', allowance: '', deduction: '', status: 'Pending'
  });

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'payroll'));
      setPayrollData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPayroll(); }, []);

  const handleAddPayroll = async (e) => {
    e.preventDefault();
    try {
      const basic = parseFloat(newPayroll.basicSalary) || 0;
      const allow = parseFloat(newPayroll.allowance) || 0;
      const deduct = parseFloat(newPayroll.deduction) || 0;
      const net = basic + allow - deduct;

      await addDoc(collection(db, 'payroll'), {
        staffName: newPayroll.staffName,
        role: newPayroll.role,
        basicSalary: basic,
        allowance: allow,
        deduction: deduct,
        netPay: net,
        status: newPayroll.status,
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
      });
      setShowAddModal(false);
      setNewPayroll({ staffName: '', role: 'Teacher', basicSalary: '', allowance: '', deduction: '', status: 'Pending' });
      fetchPayroll();
    } catch (e) { console.error(e); }
  };

  const handleEditPayroll = async (e) => {
    e.preventDefault();
    try {
      const basic = parseFloat(editingPayroll.basicSalary) || 0;
      const allow = parseFloat(editingPayroll.allowance) || 0;
      const deduct = parseFloat(editingPayroll.deduction) || 0;
      const net = basic + allow - deduct;

      await updateDoc(doc(db, 'payroll', editingPayroll.id), {
        staffName: editingPayroll.staffName,
        role: editingPayroll.role,
        basicSalary: basic,
        allowance: allow,
        deduction: deduct,
        netPay: net,
        status: editingPayroll.status,
      });
      setEditingPayroll(null);
      fetchPayroll();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this payroll record?')) {
      try { await deleteDoc(doc(db, 'payroll', id)); fetchPayroll(); }
      catch (e) { console.error(e); }
    }
  };

  const handlePrintPayslip = (record) => {
    const printWindow = window.open('', '', 'height=600,width=800');
    const html = `
      <html>
        <head>
          <title>Payslip - ${record.staffName}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #6366f1; padding-bottom: 20px; }
            h1 { margin: 0; color: #1e1b4b; }
            .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; }
            th { background-color: #f8fafc; color: #64748b; }
            .total { font-weight: bold; font-size: 1.2em; border-top: 2px solid #333; }
            .footer { text-align: center; margin-top: 50px; font-size: 0.9em; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Agtarise Academy</h1>
            <p>Staff Payslip - ${record.month || new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div class="details">
            <div><strong>Name:</strong> ${record.staffName}</div>
            <div><strong>Role:</strong> ${record.role}</div>
            <div><strong>Status:</strong> ${record.status}</div>
          </div>
          <table>
            <thead><tr><th>Earnings & Deductions</th><th>Amount (₦)</th></tr></thead>
            <tbody>
              <tr><td>Basic Salary</td><td>${record.basicSalary?.toLocaleString() || 0}</td></tr>
              <tr><td>Allowances</td><td>${record.allowance?.toLocaleString() || 0}</td></tr>
              <tr><td>Deductions</td><td>-${record.deduction?.toLocaleString() || 0}</td></tr>
              <tr class="total"><td>Net Pay</td><td>₦${record.netPay?.toLocaleString() || 0}</td></tr>
            </tbody>
          </table>
          <div class="footer"><p>This is a computer-generated document. No signature is required.</p></div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
  };

  const generatePDF = () => {
    const d = new jsPDF();
    d.text('Staff Payroll Summary', 14, 15);
    autoTable(d, {
      head: [['Staff', 'Role', 'Basic (N)', 'Allowance (N)', 'Deductions (N)', 'Net Pay (N)', 'Status']],
      body: filteredData.map(p => [p.staffName, p.role, p.basicSalary, p.allowance, p.deduction, p.netPay, p.status]),
      startY: 20,
    });
    d.save('payroll_report.pdf');
  };

  const filteredData = payrollData.filter(p => p.staffName?.toLowerCase().includes(searchTerm.toLowerCase()));

  const totalPayroll = payrollData.reduce((s, p) => s + (parseFloat(p.netPay) || 0), 0);
  const paidCount = payrollData.filter(p => p.status === 'Paid').length;
  const pendingCount = payrollData.filter(p => p.status === 'Pending').length;
  const fmt = n => n >= 1000000 ? `₦${(n / 1000000).toFixed(2)}M` : `₦${n.toLocaleString()}`;

  const inputStyle = { width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Staff <span className="text-gradient">Payroll</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage staff salaries, allowances, and print payslips.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={generatePDF} className="btn-secondary" style={{ background: 'var(--glass-bg)', color: 'white', border: '1px solid var(--glass-border)' }}>
            <Download size={18} /> Export List
          </button>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={20} /> Add Payroll Record
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(99,102,241,0.1)', borderRadius: '12px' }}><CreditCard color="var(--primary-color)" /></div>
          <div><p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Payroll Cost</p><h3 style={{ fontSize: '1.5rem' }}>{fmt(totalPayroll)}</h3></div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(16,185,129,0.1)', borderRadius: '12px' }}><CheckCircle color="var(--success)" /></div>
          <div><p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Staff Paid</p><h3 style={{ fontSize: '1.5rem' }}>{paidCount}</h3></div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(245,158,11,0.1)', borderRadius: '12px' }}><Clock color="var(--warning)" /></div>
          <div><p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pending Payments</p><h3 style={{ fontSize: '1.5rem' }}>{pendingCount}</h3></div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem', position: 'relative', width: '350px' }}>
          <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
          <input type="text" placeholder="Search staff name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.2rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }} />
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading payroll records...</div>
        ) : filteredData.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CreditCard size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>No payroll records found. Click "Add Payroll Record" to start.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>
                  {['Staff Name', 'Role', 'Basic Salary', 'Allowances', 'Deductions', 'Net Pay', 'Status', 'Actions'].map(h => <th key={h} style={{ padding: '1rem' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredData.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: '600' }}>{p.staffName}</td>
                    <td style={{ padding: '1rem' }}>{p.role}</td>
                    <td style={{ padding: '1rem' }}>₦{p.basicSalary?.toLocaleString() || 0}</td>
                    <td style={{ padding: '1rem', color: 'var(--success)' }}>+₦{p.allowance?.toLocaleString() || 0}</td>
                    <td style={{ padding: '1rem', color: 'var(--error)' }}>-₦{p.deduction?.toLocaleString() || 0}</td>
                    <td style={{ padding: '1rem', fontWeight: '700', fontSize: '1.1rem' }}>₦{p.netPay?.toLocaleString() || 0}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', background: p.status === 'Paid' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: p.status === 'Paid' ? 'var(--success)' : 'var(--warning)' }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={() => handlePrintPayslip(p)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="Print Payslip"><Printer size={16} /></button>
                        <button onClick={() => setEditingPayroll({...p})} style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }} title="Edit"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(p.id)} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }} title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setShowAddModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
            <h2 style={{ marginBottom: '1.5rem' }}>Create Payroll Record</h2>
            <form onSubmit={handleAddPayroll} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Staff Name</label><input required type="text" value={newPayroll.staffName} onChange={e=>setNewPayroll({...newPayroll, staffName: e.target.value})} style={inputStyle} /></div>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Role</label><input required type="text" value={newPayroll.role} onChange={e=>setNewPayroll({...newPayroll, role: e.target.value})} style={inputStyle} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Basic Salary (₦)</label><input required type="number" min="0" value={newPayroll.basicSalary} onChange={e=>setNewPayroll({...newPayroll, basicSalary: e.target.value})} style={inputStyle} /></div>
                <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Allowance (₦)</label><input type="number" min="0" value={newPayroll.allowance} onChange={e=>setNewPayroll({...newPayroll, allowance: e.target.value})} style={inputStyle} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Deductions (₦)</label><input type="number" min="0" value={newPayroll.deduction} onChange={e=>setNewPayroll({...newPayroll, deduction: e.target.value})} style={inputStyle} /></div>
                <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Status</label>
                  <select value={newPayroll.status} onChange={e=>setNewPayroll({...newPayroll, status: e.target.value})} style={inputStyle}>
                    <option>Pending</option><option>Paid</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>Save Record</button>
            </form>
          </div>
        </div>
      )}

      {editingPayroll && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setEditingPayroll(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
            <h2 style={{ marginBottom: '1.5rem' }}>Edit Payroll Record</h2>
            <form onSubmit={handleEditPayroll} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Staff Name</label><input required type="text" value={editingPayroll.staffName} onChange={e=>setEditingPayroll({...editingPayroll, staffName: e.target.value})} style={inputStyle} /></div>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Role</label><input required type="text" value={editingPayroll.role} onChange={e=>setEditingPayroll({...editingPayroll, role: e.target.value})} style={inputStyle} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Basic Salary (₦)</label><input required type="number" min="0" value={editingPayroll.basicSalary} onChange={e=>setEditingPayroll({...editingPayroll, basicSalary: e.target.value})} style={inputStyle} /></div>
                <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Allowance (₦)</label><input type="number" min="0" value={editingPayroll.allowance} onChange={e=>setEditingPayroll({...editingPayroll, allowance: e.target.value})} style={inputStyle} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Deductions (₦)</label><input type="number" min="0" value={editingPayroll.deduction} onChange={e=>setEditingPayroll({...editingPayroll, deduction: e.target.value})} style={inputStyle} /></div>
                <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Status</label>
                  <select value={editingPayroll.status} onChange={e=>setEditingPayroll({...editingPayroll, status: e.target.value})} style={inputStyle}>
                    <option>Pending</option><option>Paid</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>Update Record</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
