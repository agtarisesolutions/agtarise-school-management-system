import React, { useState, useEffect } from 'react';
import { CreditCard, Download, Search, CheckCircle, Clock, AlertCircle, X, Plus, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Fees = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTx, setNewTx] = useState({ student: '', amount: '', type: 'Tuition Fee', status: 'Paid', studentId: '' });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'fees'));
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error fetching fees: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleCollect = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'fees'), {
        student: newTx.student,
        studentId: newTx.studentId || `STU${Math.floor(Math.random() * 10000)}`,
        amount: `₦${parseFloat(newTx.amount).toLocaleString()}`,
        numericAmount: parseFloat(newTx.amount),
        type: newTx.type,
        status: newTx.status,
        date: new Date().toISOString().split('T')[0]
      });
      setShowCollectModal(false);
      setNewTx({ student: '', amount: '', type: 'Tuition Fee', status: 'Paid', studentId: '' });
      fetchTransactions();
    } catch (error) {
      console.error("Error adding transaction: ", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this payment record?")) {
      try {
        await deleteDoc(doc(db, 'fees', id));
        fetchTransactions();
      } catch (error) {
        console.error("Error deleting fee record: ", error);
      }
    }
  };

  const handleDownloadReceipt = (tx) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Agtarise School Receipt', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Receipt No: REC-${tx.id.slice(0, 6).toUpperCase()}`, 14, 40);
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

  const filteredTransactions = transactions.filter(tx => {
    if (user?.role === 'parent' && tx.studentId !== user.linkedStudentId) return false;
    return (tx.student?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
           (tx.type?.toLowerCase() || '').includes(searchTerm.toLowerCase());
  });

  // Calculate stats dynamically
  const totalRevenue = transactions.filter(tx => tx.status === 'Paid').reduce((sum, tx) => sum + (tx.numericAmount || 0), 0);
  const outstandingBal = transactions.filter(tx => tx.status !== 'Paid').reduce((sum, tx) => sum + (tx.numericAmount || 0), 0);
  const overdueCount = transactions.filter(tx => tx.status === 'Overdue').length;
  const totalBilled = totalRevenue + outstandingBal;
  const collectedPercentage = totalBilled > 0 ? Math.round((totalRevenue / totalBilled) * 100) : 0;

  const formatCurrency = (amount) => {
    if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `₦${(amount / 1000).toFixed(1)}K`;
    return `₦${amount || 0}`;
  };

  const inputStyle = { width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Financial <span className="text-gradient">Control</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>{user?.role === 'parent' ? "Monitor your child's school fees and payments." : "Monitor school fees, payments, and overall financial health."}</p>
        </div>
        {user?.role !== 'parent' && (
          <button className="btn-primary" onClick={() => setShowCollectModal(true)}>
            <CreditCard size={20} /> Record Payment
          </button>
        )}
      </div>

      {user?.role !== 'parent' && (
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div className="glass-card" style={{ flex: 1, minWidth: '300px', padding: '1.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), transparent)' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Revenue (Term)</p>
            <h2 style={{ fontSize: '2rem' }}>{formatCurrency(totalRevenue)}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.8rem', marginTop: '1rem' }}>
              <CheckCircle size={14} /> {collectedPercentage}% Collected
            </div>
          </div>
          <div className="glass-card" style={{ flex: 1, minWidth: '300px', padding: '1.5rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Outstanding Balances</p>
            <h2 style={{ fontSize: '2rem' }}>{formatCurrency(outstandingBal)}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error)', fontSize: '0.8rem', marginTop: '1rem' }}>
              <AlertCircle size={14} /> {overdueCount} Overdue Payments
            </div>
          </div>
        </div>
      )}

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem' }}>Recent Transactions</h3>
          <div style={{ position: 'relative', width: '250px' }}>
            <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
            <input type="text" placeholder="Search transactions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.2rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none', fontSize: '0.85rem' }} />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading financial records...</div>
        ) : filteredTransactions.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CreditCard size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>No financial records found. {user?.role !== 'parent' && "Click 'Record Payment' to start tracking fees."}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '1rem' }}>Student</th>
                  <th style={{ padding: '1rem' }}>Type</th>
                  <th style={{ padding: '1rem' }}>Amount</th>
                  <th style={{ padding: '1rem' }}>Date</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: tx.status === 'Paid' ? 'var(--success)' : tx.status === 'Pending' ? 'var(--warning)' : 'var(--error)', fontSize: '0.85rem' }}>
                        {tx.status === 'Paid' ? <CheckCircle size={14} /> : tx.status === 'Pending' ? <Clock size={14} /> : <AlertCircle size={14} />}
                        {tx.status}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button onClick={() => handleDownloadReceipt(tx)} style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }} title="Download Receipt">
                          <Download size={18} />
                        </button>
                        {user?.role !== 'parent' && (
                          <button onClick={() => handleDelete(tx.id)} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }} title="Delete Record">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCollectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setShowCollectModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
            <h2 style={{ marginBottom: '1.5rem' }}>Record Payment</h2>
            <form onSubmit={handleCollect} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Student Name</label><input required type="text" value={newTx.student} onChange={e=>setNewTx({...newTx, student: e.target.value})} style={inputStyle} /></div>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Student ID (Optional)</label><input type="text" value={newTx.studentId} onChange={e=>setNewTx({...newTx, studentId: e.target.value})} style={inputStyle} /></div>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Amount (₦)</label><input required type="number" min="0" value={newTx.amount} onChange={e=>setNewTx({...newTx, amount: e.target.value})} style={inputStyle} /></div>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Payment Type</label>
                <select value={newTx.type} onChange={e=>setNewTx({...newTx, type: e.target.value})} style={inputStyle}>
                  <option>Tuition Fee</option>
                  <option>Bus Fee</option>
                  <option>Lab Fee</option>
                  <option>Exam Fee</option>
                  <option>Registration</option>
                </select>
              </div>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Status</label>
                <select value={newTx.status} onChange={e=>setNewTx({...newTx, status: e.target.value})} style={inputStyle}>
                  <option>Paid</option>
                  <option>Pending</option>
                  <option>Overdue</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '1rem', justifyContent: 'center' }}>Save Record</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;
