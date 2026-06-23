import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { collection, getDocs, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const StaffAttendance = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [staff, setStaff] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'staff'));
        setStaff(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error fetching staff:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  useEffect(() => {
    const logDocId = `staff_${selectedDate}`;
    const unsubscribe = onSnapshot(doc(db, 'staff_attendance', logDocId), (snap) => {
      setAttendanceLogs(snap.exists() ? (snap.data().logs || {}) : {});
    });
    return () => unsubscribe();
  }, [selectedDate]);

  const handleClockAction = async (staffId, type) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const logDocId = `staff_${selectedDate}`;
    const newLogs = { ...attendanceLogs };
    if (!newLogs[staffId]) newLogs[staffId] = { status: 'Present', clockIn: '-', clockOut: '-' };
    if (type === 'in') newLogs[staffId] = { ...newLogs[staffId], status: 'Present', clockIn: now };
    if (type === 'out') newLogs[staffId] = { ...newLogs[staffId], clockOut: now };
    try {
      await setDoc(doc(db, 'staff_attendance', logDocId), {
        date: selectedDate, logs: newLogs, updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) { 
      console.error('Error updating staff attendance:', err); 
      alert('❌ Failed to update staff attendance: ' + err.message);
    }
  };

  const toggleStatus = async (staffId) => {
    const logDocId = `staff_${selectedDate}`;
    const currentLog = attendanceLogs[staffId] || { status: 'Absent', clockIn: '-', clockOut: '-' };
    const statuses = ['Present', 'Late', 'Absent'];
    const nextStatus = statuses[(statuses.indexOf(currentLog.status) + 1) % statuses.length];
    const newLogs = { ...attendanceLogs };
    newLogs[staffId] = {
      ...currentLog, status: nextStatus,
      clockIn: nextStatus === 'Absent' ? '-' : (currentLog.clockIn === '-' ? '08:00 AM' : currentLog.clockIn)
    };
    try {
      await setDoc(doc(db, 'staff_attendance', logDocId), {
        date: selectedDate, logs: newLogs, updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) { 
      console.error('Error toggling status:', err); 
      alert('❌ Failed to toggle staff attendance: ' + err.message);
    }
  };

  const generatePDF = () => {
    const pdfdoc = new jsPDF();
    pdfdoc.text(`Staff Attendance Report - ${selectedDate}`, 14, 15);
    const tableData = filteredStaff.map(s => {
      const log = attendanceLogs[s.id] || { status: 'Absent', clockIn: '-', clockOut: '-' };
      return [s.name, s.staffId || s.id, s.role, log.clockIn, log.clockOut, log.status];
    });
    autoTable(pdfdoc, {
      head: [['Name', 'ID', 'Role', 'Clock In', 'Clock Out', 'Status']],
      body: tableData, startY: 25, theme: 'grid'
    });
    pdfdoc.save(`staff_attendance_${selectedDate}.pdf`);
  };

  const filteredStaff = staff.filter(s =>
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.staffId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    present: Object.values(attendanceLogs).filter(l => l.status === 'Present').length,
    late: Object.values(attendanceLogs).filter(l => l.status === 'Late').length,
    absent: staff.length - Object.values(attendanceLogs).filter(l => l.status === 'Present' || l.status === 'Late').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Staff <span className="text-gradient">Attendance</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Track daily attendance for all teaching and non-teaching staff.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '250px' }}>
            <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
            <input type="text" placeholder="Search staff..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.2rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }} />
          </div>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            style={{ padding: '0.75rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }} />
          <button onClick={generatePDF} style={{ padding: '0.75rem 1rem', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} /> Export PDF
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {[
          { label: 'Present', value: stats.present, icon: <CheckCircle color="var(--success)" />, color: 'var(--success)' },
          { label: 'Late', value: stats.late, icon: <Clock color="var(--warning)" />, color: 'var(--warning)' },
          { label: 'Absent', value: stats.absent, icon: <XCircle color="var(--error)" />, color: 'var(--error)' },
          { label: 'Total Staff', value: staff.length, icon: <CheckCircle color="var(--primary-color)" />, color: 'var(--primary-color)' },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>{stat.icon}</div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stat.label}</p>
              <h3 style={{ fontSize: '1.5rem', color: stat.color }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Staff Register — {selectedDate}</h3>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading staff...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '1rem' }}>Name</th>
                  <th style={{ padding: '1rem' }}>ID / Role</th>
                  <th style={{ padding: '1rem' }}>Clock In</th>
                  <th style={{ padding: '1rem' }}>Clock Out</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  {user?.role === 'admin' && <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredStaff.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No staff found. Add staff members first.</td></tr>
                ) : filteredStaff.map(member => {
                  const log = attendanceLogs[member.id] || { status: 'Absent', clockIn: '-', clockOut: '-' };
                  return (
                    <tr key={member.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '0.9rem' }}>
                            {member.name ? member.name.charAt(0) : '?'}
                          </div>
                          {member.name}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                        <div style={{ color: 'var(--primary-color)', fontWeight: '600' }}>{member.staffId || member.id}</div>
                        <div style={{ color: 'var(--text-muted)' }}>{member.role}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>{log.clockIn}</td>
                      <td style={{ padding: '1rem' }}>{log.clockOut}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem',
                          background: log.status === 'Present' ? 'rgba(16,185,129,0.1)' : log.status === 'Late' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                          color: log.status === 'Present' ? 'var(--success)' : log.status === 'Late' ? 'var(--warning)' : 'var(--error)'
                        }}>{log.status}</span>
                      </td>
                      {user?.role === 'admin' && (
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button onClick={() => handleClockAction(member.id, 'in')} style={{ padding: '0.4rem 0.8rem', background: 'var(--success)', border: 'none', borderRadius: '4px', color: 'white', fontSize: '0.75rem', cursor: 'pointer' }}>In</button>
                            <button onClick={() => handleClockAction(member.id, 'out')} style={{ padding: '0.4rem 0.8rem', background: 'var(--primary-color)', border: 'none', borderRadius: '4px', color: 'white', fontSize: '0.75rem', cursor: 'pointer' }}>Out</button>
                            <button onClick={() => toggleStatus(member.id)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', padding: '0.4rem 0.6rem', borderRadius: '4px', color: 'white', fontSize: '0.75rem', cursor: 'pointer' }}>Toggle</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffAttendance;
