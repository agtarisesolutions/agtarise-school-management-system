import React, { useState } from 'react';
import { Plus, Search, MoreVertical, Edit2, Trash2, Download, TrendingUp } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Classes = () => {
  const [filter, setFilter] = useState('All');

  const classes = [
    { id: 1, name: 'Nursery 1', level: 'Nursery', students: 24, teacher: 'Mrs. Adebayo' },
    { id: 2, name: 'Primary 3', level: 'Primary', students: 32, teacher: 'Mr. Okoro' },
    { id: 3, name: 'SS 2 Science', level: 'Secondary', students: 28, teacher: 'Dr. Smith' },
    { id: 4, name: 'JSS 1 A', level: 'Secondary', students: 35, teacher: 'Miss Chima' },
    { id: 5, name: 'Primary 5 B', level: 'Primary', students: 30, teacher: 'Mr. Yusuf' },
  ];

  const filteredClasses = filter === 'All' ? classes : classes.filter(c => c.level === filter);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('School Classes Report', 14, 15);
    const tableData = filteredClasses.map(c => [c.name, c.level, c.students, c.teacher]);
    doc.autoTable({
      head: [['Class Name', 'Level', 'Students', 'Class Teacher']],
      body: tableData,
      startY: 20,
    });
    doc.save('classes_report.pdf');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Class <span className="text-gradient">Management</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage and organize classes across all school levels.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => window.location.href='/academics/promote'} className="btn-primary" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'white' }}>
            <TrendingUp size={18} /> Promote Students
          </button>
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
            <Plus size={20} /> Add New Class
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['All', 'Nursery', 'Primary', 'Secondary'].map(lvl => (
              <button 
                key={lvl}
                onClick={() => setFilter(lvl)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--glass-border)',
                  background: filter === lvl ? 'var(--primary-color)' : 'var(--glass-bg)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'var(--transition-fast)'
                }}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '250px' }}>
            <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
            <input 
              type="text" 
              placeholder="Search classes..."
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
              <th style={{ padding: '1rem' }}>Class Name</th>
              <th style={{ padding: '1rem' }}>Level</th>
              <th style={{ padding: '1rem' }}>Total Students</th>
              <th style={{ padding: '1rem' }}>Class Teacher</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClasses.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem', fontWeight: '600' }}>{item.name}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.75rem',
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: 'var(--primary-color)',
                    border: '1px solid rgba(99, 102, 241, 0.2)'
                  }}>
                    {item.level}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>{item.students}</td>
                <td style={{ padding: '1rem' }}>{item.teacher}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Edit2 size={16} /></button>
                    <button style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><MoreVertical size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Classes;
