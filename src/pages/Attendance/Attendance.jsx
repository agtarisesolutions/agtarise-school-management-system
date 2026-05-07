import React, { useState, useEffect } from 'react';
import { Calendar, Search, CheckCircle, XCircle, Clock, Filter, Download, X, Layers, Globe } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { collection, getDocs, doc, setDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const Attendance = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('SS3 A');
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  
  const [students, setStudents] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState({});
  const [loading, setLoading] = useState(true);
  
  const [availableClasses, setAvailableClasses] = useState([]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const classSnap = await getDocs(collection(db, "classes"));
        let classData = classSnap.docs.map(d => d.data().name);
        
        const stuSnap = await getDocs(collection(db, "students"));
        const stuClasses = [...new Set(stuSnap.docs.map(d => d.data().class))].filter(Boolean);
        
        classData = [...new Set([...classData, ...stuClasses])].sort();
        setAvailableClasses(classData);
        
        if (user?.role === 'teacher' && user?.assignedClass) {
          setSelectedClass(user.assignedClass);
        } else if (classData.length > 0) {
          setSelectedClass(classData[0]);
        }
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    fetchMetadata();
  }, [user]);

  // Fetch students based on class or global search
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        let q;
        if (isGlobalSearch && user?.role === 'admin') {
          q = collection(db, "students");
        } else {
          q = query(collection(db, "students"), where("class", "==", selectedClass));
        }
        
        const querySnapshot = await getDocs(q);
        const studentsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStudents(studentsData);
      } catch (error) {
        console.error("Error fetching students: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass, isGlobalSearch, user]);

  // Fetch or initialize attendance logs for the selected date
  useEffect(() => {
    const logDocId = `${selectedDate}_${selectedClass}`;
    const unsubscribe = onSnapshot(doc(db, "attendance_logs", logDocId), (doc) => {
      if (doc.exists()) {
        setAttendanceLogs(doc.data().logs || {});
      } else {
        setAttendanceLogs({});
      }
    });

    return () => unsubscribe();
  }, [selectedDate, selectedClass]);

  const handleClockAction = async (studentId, type) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const logDocId = `${selectedDate}_${selectedClass}`;
    
    const newLogs = { ...attendanceLogs };
    if (!newLogs[studentId]) {
      newLogs[studentId] = { status: 'Present', clockIn: '-', clockOut: '-' };
    }

    if (type === 'in') {
      newLogs[studentId] = { ...newLogs[studentId], status: 'Present', clockIn: now };
    } else if (type === 'out') {
      newLogs[studentId] = { ...newLogs[studentId], clockOut: now };
    }

    try {
      await setDoc(doc(db, "attendance_logs", logDocId), {
        date: selectedDate,
        className: selectedClass,
        logs: newLogs,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error("Error updating attendance: ", error);
    }
  };

  const toggleStatus = async (studentId) => {
    const logDocId = `${selectedDate}_${selectedClass}`;
    const currentLog = attendanceLogs[studentId] || { status: 'Absent', clockIn: '-', clockOut: '-' };
    
    const statuses = ['Present', 'Late', 'Absent'];
    const currentIndex = statuses.indexOf(currentLog.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    const newLogs = { ...attendanceLogs };
    newLogs[studentId] = { 
      ...currentLog, 
      status: nextStatus,
      clockIn: nextStatus === 'Absent' ? '-' : (currentLog.clockIn === '-' ? '08:00 AM' : currentLog.clockIn)
    };

    try {
      await setDoc(doc(db, "attendance_logs", logDocId), {
        date: selectedDate,
        className: selectedClass,
        logs: newLogs,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error("Error toggling status: ", error);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(`Attendance Report - ${selectedClass} (${selectedDate})`, 14, 15);
    
    const tableData = filteredStudents.map(s => {
      const log = attendanceLogs[s.id] || { status: 'Absent', clockIn: '-', clockOut: '-' };
      return [s.name, s.studentId || s.id, s.class, log.clockIn, log.clockOut, log.status];
    });

    autoTable(doc, {
      head: [['Name', 'ID', 'Class', 'In', 'Out', 'Status']],
      body: tableData,
      startY: 25,
      theme: 'grid',
      headStyles: { fillStyle: '#6366f1' }
    });
    doc.save(`attendance_${selectedClass}_${selectedDate}.pdf`);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.studentId && s.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    present: Object.values(attendanceLogs).filter(l => l.status === 'Present').length,
    late: Object.values(attendanceLogs).filter(l => l.status === 'Late').length,
    absent: students.length - Object.values(attendanceLogs).filter(l => l.status === 'Present' || l.status === 'Late').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Attendance <span className="text-gradient">Tracker</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>{user?.role === 'teacher' ? `Class: ${user.assignedClass}` : 'Global school attendance monitoring'}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user?.role === 'admin' && (
            <button 
              onClick={() => setIsGlobalSearch(!isGlobalSearch)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem',
                background: isGlobalSearch ? 'var(--primary-color)' : 'var(--glass-bg)',
                border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', cursor: 'pointer'
              }}
            >
              <Globe size={18} /> {isGlobalSearch ? 'Global Mode' : 'Class Mode'}
            </button>
          )}
          <div style={{ position: 'relative', width: '250px' }}>
            <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
            <input 
              type="text" placeholder="Search students..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.2rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
            />
          </div>
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
          { label: 'Total Students', value: students.length, icon: <Calendar color="var(--primary-color)" />, color: 'var(--primary-color)' },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>{stat.icon}</div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stat.label}</p>
              <h3 style={{ fontSize: '1.5rem', color: stat.color }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem' }}>{isGlobalSearch ? 'All Students' : `Attendance: ${selectedClass}`}</h3>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            {!isGlobalSearch && user?.role !== 'teacher' && (
              <select 
                value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
                style={{ padding: '0.6rem 1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
              >
                {availableClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
              </select>
            )}
            <input 
              type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
              style={{ padding: '0.6rem 1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading students...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '1rem' }}>Student Name</th>
                  <th style={{ padding: '1rem' }}>ID / Class</th>
                  <th style={{ padding: '1rem' }}>Clock In</th>
                  <th style={{ padding: '1rem' }}>Clock Out</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>No students found.</td></tr>
                ) : filteredStudents.map((stu) => {
                  const log = attendanceLogs[stu.id] || { status: 'Absent', clockIn: '-', clockOut: '-' };
                  return (
                    <tr key={stu.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{stu.name}</td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                        <div>{stu.studentId}</div>
                        <div style={{ color: 'var(--text-muted)' }}>{stu.class}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>{log.clockIn}</td>
                      <td style={{ padding: '1rem' }}>{log.clockOut}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem',
                          background: log.status === 'Present' ? 'rgba(16, 185, 129, 0.1)' : log.status === 'Late' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: log.status === 'Present' ? 'var(--success)' : log.status === 'Late' ? 'var(--warning)' : 'var(--error)'
                        }}>
                          {log.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button 
                            onClick={() => handleClockAction(stu.id, 'in')}
                            style={{ padding: '0.4rem 0.8rem', background: 'var(--success)', border: 'none', borderRadius: '4px', color: 'white', fontSize: '0.75rem', cursor: 'pointer' }}
                          >In</button>
                          <button 
                            onClick={() => handleClockAction(stu.id, 'out')}
                            style={{ padding: '0.4rem 0.8rem', background: 'var(--primary-color)', border: 'none', borderRadius: '4px', color: 'white', fontSize: '0.75rem', cursor: 'pointer' }}
                          >Out</button>
                          <button 
                            onClick={() => toggleStatus(stu.id)}
                            style={{ background: 'transparent', border: '1px solid var(--glass-border)', padding: '0.4rem 0.6rem', borderRadius: '4px', color: 'white', fontSize: '0.75rem', cursor: 'pointer' }}
                          >Status</button>
                        </div>
                      </td>
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

export default Attendance;
