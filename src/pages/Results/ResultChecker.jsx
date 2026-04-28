import React, { useState } from 'react';
import { Search, FileText, Download, Award, ChevronRight } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ResultChecker = () => {
  const [stuId, setStuId] = useState('');
  const [showResult, setShowResult] = useState(false);

  const mockResult = {
    student: 'Chinedu Eze',
    class: 'SS3 A',
    term: 'Second Term 2025/2026',
    subjects: [
      { name: 'Mathematics', ca: 32, exam: 58, total: 90, grade: 'A1', remark: 'Excellent' },
      { name: 'English', ca: 28, exam: 52, total: 80, grade: 'B2', remark: 'Very Good' },
      { name: 'Physics', ca: 35, exam: 55, total: 90, grade: 'A1', remark: 'Excellent' },
      { name: 'Chemistry', ca: 30, exam: 48, total: 78, grade: 'B3', remark: 'Good' },
    ]
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (stuId === 'STU001') setShowResult(true);
    else alert('Student ID not found or result not released.');
  };

  const downloadResult = () => {
    const doc = new jsPDF();
    doc.text('Agtarise Academy - Academic Report Sheet', 14, 15);
    doc.text(`Student: ${mockResult.student} | Class: ${mockResult.class}`, 14, 25);
    doc.text(`Term: ${mockResult.term}`, 14, 32);
    
    const tableData = mockResult.subjects.map(s => [s.name, s.ca, s.exam, s.total, s.grade, s.remark]);
    doc.autoTable({
      head: [['Subject', 'C.A (40)', 'Exam (60)', 'Total (100)', 'Grade', 'Remark']],
      body: tableData,
      startY: 40,
    });
    
    doc.save(`${mockResult.student}_result.pdf`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Academic <span className="text-gradient">Results</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>Securely access and download terminal report sheets.</p>
      </div>

      {!showResult ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Award size={60} color="var(--primary-color)" style={{ marginBottom: '1.5rem' }} />
          <h3 style={{ marginBottom: '1.5rem' }}>Enter Student ID to View Result</h3>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <input 
              type="text" 
              placeholder="e.g. STU001"
              value={stuId}
              onChange={(e) => setStuId(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '300px',
                padding: '0.8rem 1.5rem',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                color: 'white',
                outline: 'none',
                fontSize: '1rem'
              }}
              required
            />
            <button type="submit" className="btn-primary" style={{ padding: '0 2rem' }}>
              Check Result <ChevronRight size={18} />
            </button>
          </form>
          <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Note: Use your unique Admission Number. Contact the school admin if you've lost it.
          </p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{mockResult.student}</h2>
              <p style={{ color: 'var(--text-muted)' }}>{mockResult.class} | {mockResult.term}</p>
            </div>
            <button onClick={downloadResult} className="btn-primary">
              <Download size={18} /> Download Report Sheet
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem' }}>Subject</th>
                <th style={{ padding: '1rem' }}>C.A</th>
                <th style={{ padding: '1rem' }}>Exam</th>
                <th style={{ padding: '1rem' }}>Total</th>
                <th style={{ padding: '1rem' }}>Grade</th>
                <th style={{ padding: '1rem' }}>Remark</th>
              </tr>
            </thead>
            <tbody>
              {mockResult.subjects.map((sub, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem', fontWeight: '600' }}>{sub.name}</td>
                  <td style={{ padding: '1rem' }}>{sub.ca}</td>
                  <td style={{ padding: '1rem' }}>{sub.exam}</td>
                  <td style={{ padding: '1rem', fontWeight: '700' }}>{sub.total}</td>
                  <td style={{ padding: '1rem', color: 'var(--primary-color)', fontWeight: '700' }}>{sub.grade}</td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{sub.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--primary-color)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Principal's Remark</h4>
            <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
              "An outstanding performance. Chinedu has shown great improvement in his scientific analysis skills. Keep up the good work."
            </p>
          </div>
          
          <button onClick={() => setShowResult(false)} style={{ marginTop: '2rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ← Back to Search
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultChecker;
