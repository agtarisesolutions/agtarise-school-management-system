import React, { useState } from 'react';
import { CreditCard, Download, Search, CheckCircle, Clock, AlertCircle, X, Plus } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Fees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [transactions, setTransactions] = useState([
    { id: 1, student: 'John Doe', amount: '₦150,000', type: 'Tuition Fee', date: '2024-04-20', status: 'Paid' },
    { id: 2, student: 'Jane Smith', amount: '₦45,000', type: 'Bus Fee', date: '2024-04-18', status: 'Pending' },
    { id: 3, student: 'Alice Brown', amount: '₦12,500', type: 'Lab Fee', date: '2024-04-15', status: 'Paid' },
    { id: 4, student: 'Bob Wilson', amount: '₦150,000', type: 'Tuition Fee', date: '2024-04-12', status: 'Overdue' },
  ]);

  const handleCollect = (e) => {
    e.preventDefault();
    alert("Payment collection successful! (In a real app, this would redirect to a payment gateway).");
    setShowCollectModal(false);
  };

  const handleDownloadReceipt = (tx) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Agtarise School Receipt', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Receipt No: REC-${tx.id}${Date.now().toString().slice(-4)}`, 14, 40);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 47);
    
    autoTable(doc, {
      startY: 60,
      head: [['Description', 'Details']],
      body: [
        ['Student Name', tx.student],
        ['Payment Type', tx.type],
        ['Amount Paid', tx.amount.replace('₦', 'N')],
        ['Payment Date', tx.date],
        ['Status', tx.status],
      ],
      theme: 'grid',
      headStyles: { fillStyle: '#6366f1' }
    });

    doc.text('Authorized Signature', 140, doc.lastAutoTable.finalY + 30);
    doc.save(`receipt_${tx.student.replace(/\s+/g, '_')}.pdf`);
  };

  const filteredTransactions = transactions.filter(tx => 
    tx.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Financial <span className="text-gradient">Control</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor school fees, payments, and overall financial health.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCollectModal(true)}>
          <CreditCard size={20} /> Collect Payment
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ flex: 1, minWidth: '300px', padding: '1.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), transparent)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Revenue (Term)</p>
          <h2 style={{ fontSize: '2rem' }}>₦12.8M</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.8rem', marginTop: '1rem' }}>
            <CheckCircle size={14} /> 85% Collected
          </div>
        </div>
        <div className="glass-card" style={{ flex: 1, minWidth: '300px', padding: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Outstanding Balances</p>
          <h2 style={{ fontSize: '2rem' }}>₦2.4M</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error)', fontSize: '0.8rem', marginTop: '1rem' }}>
            <AlertCircle size={14} /> 42 Students Overdue
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem' }}>Recent Transactions</h3>
          <div style={{ position: 'relative', width: '250px' }}>
            <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
            <input 
              type="text" 
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                color: 'white',
                outline: 'none',
                fontSize: '0.85rem'
              }}
            />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '1rem' }}>Student</th>
              <th style={{ padding: '1rem' }}>Type</th>
              <th style={{ padding: '1rem' }}>Amount</th>
              <th style={{ padding: '1rem' }}>Date</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx) => (
              <tr key={tx.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem', fontWeight: '500' }}>{tx.student}</td>
                <td style={{ padding: '1rem' }}>{tx.type}</td>
                <td style={{ padding: '1rem', fontWeight: '600' }}>{tx.amount}</td>
                <td style={{ padding: '1rem' }}>{tx.date}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.4rem',
                    color: tx.status === 'Paid' ? 'var(--success)' : tx.status === 'Pending' ? 'var(--warning)' : 'var(--error)',
                    fontSize: '0.85rem'
                  }}>
                    {tx.status === 'Paid' ? <CheckCircle size={14} /> : tx.status === 'Pending' ? <Clock size={14} /> : <AlertCircle size={14} />}
                    {tx.status}
                  </div>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => handleDownloadReceipt(tx)} style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}>
                    <Download size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCollectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setShowCollectModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '1.5rem' }}>Collect Payment</h2>
            <form onSubmit={handleCollect} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Student Name</label>
                <input required type="text" placeholder="Search student..." style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Amount (₦)</label>
                <input required type="number" placeholder="e.g. 50000" style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Payment Type</label>
                <select style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }}>
                  <option>Tuition Fee</option>
                  <option>Bus Fee</option>
                  <option>Lab Fee</option>
                  <option>Exam Fee</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '1rem', justifyContent: 'center' }}>Complete Payment</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;
