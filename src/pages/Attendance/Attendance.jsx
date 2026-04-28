import React, { useState } from 'react';
import { Calendar, Search, CheckCircle, XCircle, Clock, Filter, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Attendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const attendanceData = [
    { id: 'STU001', name: 'Chinedu Eze', class: 'SS3 A', status: 'Present', time: '07:45 AM' },
    { id: 'STU002', name: 'Fatima Ibrahim', class: 'SS3 A', status: 'Late', time: '08:15 AM' },
    { id: 'STU003', name: 'Oluwaseun Ade', class: 'SS3 A', status: 'Absent', time: '-' },
    { id: 'STU004', name: 'Ngozi Okoro', class: 'SS3 A', status: 'Present', time: '07:50 AM' },
    { id: 'STU005', name: 'Kelechi Nwosu', class: 'SS3 A', status: 'Present', time: '07:30 AM' },
  ];

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(`Attendance Report - ${selectedDate}`, 14, 15);
    const tableData = attendanceData.map(a => [a.name, a.class, a.time, a.status]);
    doc.autoTable({
      head: [['Student Name', 'Class', 'Check-in Time', 'Status']],
      body: tableData,
      startY: 20,
    });
    doc.save(`attendance_${selectedDate}.pdf`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Attendance <span className="text-gradient">Tracker</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor daily attendance for students and staff with real-time logs.</p>
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
            <Download size={18} /> Export Log
          </button>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: '0.6rem 1rem',
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-md)',
              color: 'white',
              outline: 'none'
            }}
          />
          <button className="btn-primary">
            <Calendar size={18} /> Mark Attendance
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {[
          { label: 'Present Today', value: '1,152', icon: <CheckCircle color="var(--success)" />, color: 'var(--success)' },
          { label: 'Late Arrival', value: '42', icon: <Clock color="var(--warning)" />, color: 'var(--warning)' },
          { label: 'Absent', value: '18', icon: <XCircle color="var(--error)" />, color: 'var(--error)' },
          { label: 'Avg. Attendance', value: '96%', icon: <Calendar color="var(--primary-color)" />, color: 'var(--primary-color)' },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stat.label}</p>
              <h3 style={{ fontSize: '1.25rem', color: stat.color }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem' }}>Daily Attendance Log (SS3 A)</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ position: 'relative', width: '250px' }}>
              <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
              <input 
                type="text" 
                placeholder="Search students..."
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
            <button style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.5rem 1rem', 
              background: 'var(--glass-bg)', 
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-md)',
              color: 'white',
              fontSize: '0.85rem'
            }}>
              <Filter size={16} /> Class
            </button>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '1rem' }}>Student Name</th>
              <th style={{ padding: '1rem' }}>Class</th>
              <th style={{ padding: '1rem' }}>Check-in Time</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((row) => (
              <tr key={row.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem', fontWeight: '500' }}>{row.name}</td>
                <td style={{ padding: '1rem' }}>{row.class}</td>
                <td style={{ padding: '1rem' }}>{row.time}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: 'var(--radius-full)', 
                    fontSize: '0.8rem',
                    background: row.status === 'Present' ? 'rgba(16, 185, 129, 0.1)' : row.status === 'Late' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: row.status === 'Present' ? 'var(--success)' : row.status === 'Late' ? 'var(--warning)' : 'var(--error)'
                  }}>
                    {row.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.85rem' }}>Update</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
