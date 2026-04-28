import React from 'react';
import { CreditCard, Download, Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const Fees = () => {
  const transactions = [
    { id: 1, student: 'John Doe', amount: '₦150,000', type: 'Tuition Fee', date: '2024-04-20', status: 'Paid' },
    { id: 2, student: 'Jane Smith', amount: '₦45,000', type: 'Bus Fee', date: '2024-04-18', status: 'Pending' },
    { id: 3, student: 'Alice Brown', amount: '₦12,500', type: 'Lab Fee', date: '2024-04-15', status: 'Paid' },
    { id: 4, student: 'Bob Wilson', amount: '₦150,000', type: 'Tuition Fee', date: '2024-04-12', status: 'Overdue' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Financial <span className="text-gradient">Control</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor school fees, payments, and overall financial health.</p>
        </div>
        <button className="btn-primary">
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
            {transactions.map((tx) => (
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
                  <button style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}>
                    <Download size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Fees;
