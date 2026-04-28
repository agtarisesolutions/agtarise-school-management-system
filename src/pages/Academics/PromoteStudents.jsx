import React, { useState } from 'react';
import { TrendingUp, Users, ArrowRight, ShieldCheck, Filter } from 'lucide-react';

const PromoteStudents = () => {
  const [fromClass, setFromClass] = useState('JSS 3');
  const [toClass, setToClass] = useState('SS 1');

  const students = [
    { id: 'STU010', name: 'Victor Moses', average: '82%', status: 'Qualified' },
    { id: 'STU011', name: 'Blessing Paul', average: '74%', status: 'Qualified' },
    { id: 'STU012', name: 'David Mark', average: '42%', status: 'Repeat' },
    { id: 'STU013', name: 'Sarah James', average: '91%', status: 'Qualified' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Student <span className="text-gradient">Promotion</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Mass promote students to the next class based on performance and age.</p>
        </div>
        <button className="btn-primary" style={{ background: 'var(--success)' }}>
          <TrendingUp size={18} /> Confirm Mass Promotion
        </button>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Current Class</p>
          <select value={fromClass} onChange={(e) => setFromClass(e.target.value)} style={{ padding: '0.75rem 2rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', fontWeight: '700' }}>
            <option>JSS 3</option>
            <option>SS 1</option>
            <option>SS 2</option>
          </select>
        </div>
        <ArrowRight size={32} color="var(--primary-color)" />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Target Class</p>
          <select value={toClass} onChange={(e) => setToClass(e.target.value)} style={{ padding: '0.75rem 2rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', fontWeight: '700' }}>
            <option>SS 1</option>
            <option>SS 2</option>
            <option>SS 3</option>
          </select>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem' }}>Promotion Eligibility List</h3>
          <span style={{ fontSize: '0.85rem', padding: '0.4rem 1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 'var(--radius-full)', border: '1px solid var(--primary-color)', color: 'var(--primary-color)' }}>
            Pass Mark: 50%
          </span>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '1rem' }}>Student ID</th>
              <th style={{ padding: '1rem' }}>Student Name</th>
              <th style={{ padding: '1rem' }}>Sessional Average</th>
              <th style={{ padding: '1rem' }}>Decision</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Manual Override</th>
            </tr>
          </thead>
          <tbody>
            {students.map((stu) => (
              <tr key={stu.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem' }}>{stu.id}</td>
                <td style={{ padding: '1rem', fontWeight: '600' }}>{stu.name}</td>
                <td style={{ padding: '1rem' }}>{stu.average}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: 'var(--radius-full)', 
                    fontSize: '0.8rem',
                    background: stu.status === 'Qualified' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: stu.status === 'Qualified' ? 'var(--success)' : 'var(--error)'
                  }}>
                    {stu.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button style={{ padding: '0.4rem 0.8rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', fontSize: '0.8rem', cursor: 'pointer' }}>
                    Edit Decision
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid var(--warning)' }}>
        <ShieldCheck size={24} color="var(--warning)" />
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <strong>Security Warning:</strong> Student promotion is a sessional operation. Once confirmed, student records will be updated across all modules including Finance and Academics.
        </p>
      </div>
    </div>
  );
};

export default PromoteStudents;
