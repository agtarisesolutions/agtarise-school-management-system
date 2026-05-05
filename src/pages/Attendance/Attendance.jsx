import React, { useState, useEffect } from 'react';
import { Calendar, Search, CheckCircle, XCircle, Clock, Filter, Download, X, Layers } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../../context/AuthContext';

const Attendance = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('SS3 A');
  
  // Available classes (for Admin/Management selection)
  const availableClasses = ['JSS 1 A', 'JSS 2 B', 'SS1 C', 'SS2 A', 'SS3 A'];

  useEffect(() => {
    // If user is a teacher, automatically restrict to their assigned class
    if (user?.role === 'teacher' && user?.assignedClass) {
      setSelectedClass(user.assignedClass);
    }
  }, [user]);

  const [attendance, setAttendance] = useState([
    { id: 'STU001', name: 'Chinedu Eze', class: 'SS3 A', status: 'Present', clockIn: '07:45 AM', clockOut: '-' },
    { id: 'STU002', name: 'Fatima Ibrahim', class: 'SS3 A', status: 'Late', clockIn: '08:15 AM', clockOut: '-' },
    { id: 'STU003', name: 'Oluwaseun Ade', class: 'SS3 A', status: 'Absent', clockIn: '-', clockOut: '-' },
    { id: 'STU004', name: 'Ngozi Okoro', class: 'SS3 A', status: 'Present', clockIn: '07:50 AM', clockOut: '-' },
    { id: 'STU005', name: 'Kelechi Nwosu', class: 'SS3 A', status: 'Present', clockIn: '07:30 AM', clockOut: '-' },
    { id: 'STU006', name: 'Adebayo Samuel', class: 'JSS 1 A', status: 'Present', clockIn: '07:40 AM', clockOut: '-' },
  ]);

  const handleClockAction = (id, type) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAttendance(attendance.map(item => {
      if (item.id === id) {
        if (type === 'in') {
          return { ...item, status: 'Present', clockIn: now, clockOut: '-' };
        } else if (type === 'out') {
          return { ...item, clockOut: now };
        }
      }
      return item;
    }));
  };

  const toggleStatus = (id) => {
    setAttendance(attendance.map(item => {
      if (item.id === id) {
        const statuses = ['Present', 'Late', 'Absent'];
        const currentIndex = statuses.indexOf(item.status);
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
        return { 
          ...item, 
          status: nextStatus, 
          clockIn: nextStatus === 'Absent' ? '-' : (item.clockIn === '-' ? '08:00 AM' : item.clockIn) 
        };
      }
      return item;
    }));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(`Attendance Report - ${selectedDate}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
    
    const tableData = filteredAttendance.map(a => [a.name, a.class, a.clockIn, a.clockOut, a.status]);
    autoTable(doc, {
      head: [['Student Name', 'Class', 'Clock In', 'Clock Out', 'Status']],
      body: tableData,
      startY: 30,
      theme: 'grid',
      headStyles: { fillStyle: '#6366f1' }
    });
    doc.save(`attendance_${selectedDate}.pdf`);
  };

  const filteredAttendance = attendance.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = item.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const stats = {
    present: filteredAttendance.filter(a => a.status === 'Present').length,
    late: filteredAttendance.filter(a => a.status === 'Late').length,
    absent: filteredAttendance.filter(a => a.status === 'Absent').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Attendance <span className="text-gradient">Tracker</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor daily attendance for students and staff with real-time logs.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
            <input 
              type="text" 
              placeholder="Search by name, class or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.2rem',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                color: 'white',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
          </div>
          <button onClick={generatePDF} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.75rem 1.25rem', 
            background: 'var(--primary-color)', 
            border: 'none',
            borderRadius: 'var(--radius-md)',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            <Download size={18} /> Export Filtered PDF
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {[
          { label: 'Present Today', value: stats.present, icon: <CheckCircle color="var(--success)" />, color: 'var(--success)' },
          { label: 'Late Arrival', value: stats.late, icon: <Clock color="var(--warning)" />, color: 'var(--warning)' },
          { label: 'Absent', value: stats.absent, icon: <XCircle color="var(--error)" />, color: 'var(--error)' },
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Daily Attendance Log ({selectedClass})</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Records for {new Date(selectedDate).toDateString()}</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Class Selection Dropdown (Only for Admins/Managers) */}
            {user?.role !== 'teacher' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={16} color="var(--text-muted)" />
                <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  style={{
                    padding: '0.6rem 1rem',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'white',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                >
                  {availableClasses.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            )}
            
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
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '1rem' }}>Student Name</th>
              <th style={{ padding: '1rem' }}>Class</th>
              <th style={{ padding: '1rem' }}>Clock In</th>
              <th style={{ padding: '1rem' }}>Clock Out</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendance.map((row) => (
              <tr key={row.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem', fontWeight: '500' }}>{row.name}</td>
                <td style={{ padding: '1rem' }}>{row.class}</td>
                <td style={{ padding: '1rem' }}>{row.clockIn}</td>
                <td style={{ padding: '1rem' }}>{row.clockOut}</td>
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
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    {row.clockIn === '-' ? (
                      <button 
                        onClick={() => handleClockAction(row.id, 'in')}
                        style={{ padding: '0.4rem 0.8rem', background: 'var(--success)', border: 'none', borderRadius: '4px', color: 'white', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        Clock In
                      </button>
                    ) : row.clockOut === '-' ? (
                      <button 
                        onClick={() => handleClockAction(row.id, 'out')}
                        style={{ padding: '0.4rem 0.8rem', background: 'var(--primary-color)', border: 'none', borderRadius: '4px', color: 'white', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        Clock Out
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed</span>
                    )}
                    <button 
                      onClick={() => toggleStatus(row.id)}
                      style={{ background: 'transparent', border: '1px solid var(--glass-border)', padding: '0.4rem 0.6rem', borderRadius: '4px', color: 'white', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      Status
                    </button>
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

export default Attendance;
