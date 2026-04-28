import React from 'react';
import { FileText, Download, BarChart2, PieChart, TrendingUp, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Reports = () => {
  const generatePDF = (title, data, columns) => {
    const doc = new jsPDF();
    doc.text(title, 14, 15);
    doc.autoTable({
      head: [columns],
      body: data,
      startY: 20,
    });
    doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
  };

  const academicData = [
    ['Mathematics', 'A', '92%'],
    ['English', 'B+', '85%'],
    ['Physics', 'A-', '88%'],
    ['Chemistry', 'B', '78%'],
  ];

  const financialData = [
    ['Tuition Fees', '₦8.5M', 'Collected'],
    ['Transportation', '₦1.2M', 'Pending'],
    ['Lab Fees', '₦450k', 'Collected'],
    ['Extracurricular', '₦300k', 'Pending'],
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Reports & <span className="text-gradient">Analytics</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Generate automated reports for academics, finance, and attendance.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-color)', borderRadius: '12px' }}>
              <BarChart2 size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Academic Performance</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Class-wise and subject-wise analysis.</p>
            </div>
          </div>
          <button 
            onClick={() => generatePDF('Academic Performance Report', academicData, ['Subject', 'Grade', 'Score'])}
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Download size={18} /> Download PDF
          </button>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '12px' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Financial Statement</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Revenue, expenses, and pending fees.</p>
            </div>
          </div>
          <button 
            onClick={() => generatePDF('Financial Statement Report', financialData, ['Description', 'Amount', 'Status'])}
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Download size={18} /> Download PDF
          </button>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', borderRadius: '12px' }}>
              <Calendar size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Attendance Summary</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Staff and student attendance logs.</p>
            </div>
          </div>
          <button 
            onClick={() => generatePDF('Attendance Summary Report', [['Students', '94%'], ['Staff', '98%']], ['Category', 'Average'])}
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Download size={18} /> Download PDF
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
        <PieChart size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
        <h3 style={{ marginBottom: '0.5rem' }}>Advanced Analytics Dashboard</h3>
        <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
          Upgrade to Enterprise to unlock AI-powered insights, predictive student performance, and automated tax reporting.
        </p>
        <button style={{ 
          padding: '0.75rem 2rem', 
          background: 'transparent', 
          border: '1px solid var(--primary-color)', 
          color: 'var(--primary-color)',
          borderRadius: 'var(--radius-md)',
          fontWeight: '600',
          cursor: 'pointer'
        }}>Learn More</button>
      </div>
    </div>
  );
};

export default Reports;
