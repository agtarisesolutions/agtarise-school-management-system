import React from 'react';
import { BookOpen, Plus, Search, Filter, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Subjects = () => {
  const subjects = [
    { id: 1, name: 'Mathematics', code: 'MATH101', level: 'General', classes: 'Primary 1 - SS3' },
    { id: 2, name: 'English Language', code: 'ENG101', level: 'General', classes: 'All Classes' },
    { id: 3, name: 'Physics', code: 'PHY201', level: 'Science', classes: 'SS1 - SS3' },
    { id: 4, name: 'Economics', code: 'ECO201', level: 'Social Science', classes: 'SS1 - SS3' },
    { id: 5, name: 'Basic Science', code: 'SCI101', level: 'Basic', classes: 'Pry 1 - JSS3' },
  ];

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Subject Curriculum Report', 14, 15);
    const tableData = subjects.map(s => [s.name, s.code, s.level, s.classes]);
    doc.autoTable({
      head: [['Subject Name', 'Code', 'Department', 'Applicable Classes']],
      body: tableData,
      startY: 20,
    });
    doc.save('subject_curriculum.pdf');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Subject <span className="text-gradient">Curriculum</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Define and manage subjects across different academic departments.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={generatePDF} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.75rem 1.25rem', 
            background: 'var(--glass-bg)', 
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            color: 'white',
            cursor: 'pointer'
          }}>
            <Download size={18} /> Export List
          </button>
          <button className="btn-primary">
            <Plus size={20} /> Add New Subject
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {subjects.map((sub) => (
          <div key={sub.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <BookOpen size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem' }}>{sub.name}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>{sub.code}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{sub.classes}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ 
                  fontSize: '0.7rem', 
                  padding: '0.2rem 0.6rem', 
                  background: 'var(--glass-bg)', 
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--glass-border)'
                }}>
                  {sub.level}
                </span>
                <button style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'var(--primary-color)', 
                  fontSize: '0.8rem', 
                  fontWeight: '600', 
                  cursor: 'pointer' 
                }}>Edit Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subjects;
