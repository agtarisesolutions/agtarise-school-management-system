import React, { useState } from 'react';
import { Save, User, Book, CheckCircle, AlertCircle } from 'lucide-react';

const GradeBook = () => {
  const [selectedClass, setSelectedClass] = useState('SS3 A');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');

  const students = [
    { id: 'STU001', name: 'Chinedu Eze', test: 24, exam: 58 },
    { id: 'STU002', name: 'Fatima Ibrahim', test: 28, exam: 62 },
    { id: 'STU004', name: 'Ngozi Okoro', test: 22, exam: 55 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Digital <span className="text-gradient">Gradebook</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Enter student marks for Continuous Assessment and Examinations.</p>
        </div>
        <button className="btn-primary">
          <Save size={18} /> Save All Marks
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Select Class</label>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{ padding: '0.75rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }}
          >
            <option>SS3 A</option>
            <option>SS3 B</option>
            <option>SS2 A</option>
          </select>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Select Subject</label>
          <select 
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{ padding: '0.75rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }}
          >
            <option>Mathematics</option>
            <option>Further Mathematics</option>
            <option>Physics</option>
          </select>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '1rem' }}>Student ID</th>
              <th style={{ padding: '1rem' }}>Student Name</th>
              <th style={{ padding: '1rem' }}>C.A (40)</th>
              <th style={{ padding: '1rem' }}>Exam (60)</th>
              <th style={{ padding: '1rem' }}>Total (100)</th>
              <th style={{ padding: '1rem' }}>Grade</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((stu) => {
              const total = stu.test + stu.exam;
              const grade = total >= 75 ? 'A1' : total >= 70 ? 'B2' : total >= 65 ? 'B3' : total >= 60 ? 'C4' : total >= 55 ? 'C5' : total >= 50 ? 'C6' : 'F9';
              return (
                <tr key={stu.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem', color: 'var(--primary-color)', fontWeight: '600' }}>{stu.id}</td>
                  <td style={{ padding: '1rem' }}>{stu.name}</td>
                  <td style={{ padding: '1rem' }}>
                    <input type="number" defaultValue={stu.test} style={{ width: '60px', padding: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'white' }} />
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <input type="number" defaultValue={stu.exam} style={{ width: '60px', padding: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'white' }} />
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '700' }}>{total}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ color: total >= 50 ? 'var(--success)' : 'var(--error)' }}>{grade}</span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <CheckCircle size={18} color="var(--success)" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GradeBook;
