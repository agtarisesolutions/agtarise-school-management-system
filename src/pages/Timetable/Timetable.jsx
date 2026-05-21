import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, User, Download, Plus, X, Trash2, Edit2 } from 'lucide-react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Timetable = () => {
  const { user } = useAuth();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [newPeriod, setNewPeriod] = useState({
    timeStart: '', timeEnd: '', subject: '', teacher: '', day: 'Monday'
  });

  const fetchPeriods = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "timetable"));
      const querySnapshot = await getDocs(q);
      const periodsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPeriods(periodsData);
    } catch (error) {
      console.error("Error fetching timetable: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const handleAddPeriod = async (e) => {
    e.preventDefault();
    try {
      const formattedTime = `${newPeriod.timeStart} - ${newPeriod.timeEnd}`;
      await addDoc(collection(db, "timetable"), {
        day: newPeriod.day,
        time: formattedTime,
        subject: newPeriod.subject,
        teacher: newPeriod.teacher,
        timeStartSort: newPeriod.timeStart // For sorting if needed
      });
      setShowAddModal(false);
      setNewPeriod({ timeStart: '', timeEnd: '', subject: '', teacher: '', day: selectedDay });
      fetchPeriods();
    } catch (error) {
      console.error("Error adding period: ", error);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to remove this period?")) {
      try {
        await deleteDoc(doc(db, "timetable", id));
        fetchPeriods();
      } catch (error) {
        console.error("Error deleting period: ", error);
      }
    }
  };

  const handleEditPeriod = async (e) => {
    e.preventDefault();
    try {
      const [ts, te] = editingPeriod.time.split(' - ');
      await updateDoc(doc(db, "timetable", editingPeriod.id), {
        day: editingPeriod.day,
        time: editingPeriod.time,
        subject: editingPeriod.subject,
        teacher: editingPeriod.teacher,
        timeStartSort: ts?.trim() || ''
      });
      setEditingPeriod(null);
      fetchPeriods();
    } catch (error) {
      console.error("Error updating period: ", error);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(`Timetable Report - ${selectedDay}`, 14, 15);
    const tableData = displayPeriods.map(p => [p.time, p.subject, p.teacher]);
    doc.autoTable({
      head: [['Time', 'Subject', 'Teacher']],
      body: tableData,
      startY: 20,
    });
    doc.save(`timetable_${selectedDay}.pdf`);
  };

  const displayPeriods = periods
    .filter(p => p.day === selectedDay)
    .sort((a, b) => a.timeStartSort?.localeCompare(b.timeStartSort));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Class <span className="text-gradient">Timetable</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Weekly schedule for academic activities and examinations.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={generatePDF} className="btn-primary" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'white' }}>
            <Download size={18} /> Export Timetable
          </button>
          {user?.role !== 'parent' && user?.role !== 'student' && (
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={18} /> Add Period
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
        {days.map(day => (
          <button 
            key={day} 
            onClick={() => setSelectedDay(day)}
            style={{ 
              padding: '0.6rem 1.5rem', 
              background: day === selectedDay ? 'var(--primary-color)' : 'var(--glass-bg)', 
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-full)',
              color: 'white',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}>
            {day}
          </button>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading schedule...</div>
        ) : displayPeriods.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No periods scheduled for {selectedDay}.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {displayPeriods.map((period, i) => (
              <div key={period.id} style={{ 
                padding: '1.5rem', 
                background: period.subject.toUpperCase() === 'BREAK' ? 'rgba(245, 158, 11, 0.05)' : 'var(--glass-bg)', 
                borderRadius: 'var(--radius-md)', 
                border: period.subject.toUpperCase() === 'BREAK' ? '1px dashed var(--warning)' : '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                position: 'relative'
              }}>
                {user?.role !== 'parent' && user?.role !== 'student' && (
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.35rem' }}>
                    <button 
                      onClick={() => setEditingPeriod({...period})}
                      style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(period.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: '700' }}>
                    <Clock size={16} />
                    {period.time}
                  </div>
                  {period.subject.toUpperCase() !== 'BREAK' && <BookOpen size={16} color="var(--text-muted)" />}
                </div>
                <h3 style={{ fontSize: '1.25rem', color: period.subject.toUpperCase() === 'BREAK' ? 'var(--warning)' : 'white' }}>{period.subject}</h3>
                {period.subject.toUpperCase() !== 'BREAK' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <User size={14} />
                    {period.teacher}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setShowAddModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '1.5rem' }}>Add Period</h2>
            <form onSubmit={handleAddPeriod} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Day</label>
                <select value={newPeriod.day} onChange={e => setNewPeriod({...newPeriod, day: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }}>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Start Time</label>
                  <input required type="time" value={newPeriod.timeStart} onChange={e => setNewPeriod({...newPeriod, timeStart: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>End Time</label>
                  <input required type="time" value={newPeriod.timeEnd} onChange={e => setNewPeriod({...newPeriod, timeEnd: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Subject (Type 'BREAK' for recess)</label>
                <input required type="text" placeholder="e.g. Mathematics" value={newPeriod.subject} onChange={e => setNewPeriod({...newPeriod, subject: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Teacher Name</label>
                <input type="text" placeholder="e.g. Mr. Okoro" value={newPeriod.teacher} onChange={e => setNewPeriod({...newPeriod, teacher: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '1rem', justifyContent: 'center' }}>Save Period</button>
            </form>
          </div>
        </div>
      )}

      {editingPeriod && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setEditingPeriod(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '1.5rem' }}>Edit Period</h2>
            <form onSubmit={handleEditPeriod} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Day</label>
                <select value={editingPeriod.day} onChange={e => setEditingPeriod({...editingPeriod, day: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }}>
                  {['Monday','Tuesday','Wednesday','Thursday','Friday'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Time (e.g. 08:00 - 09:00)</label>
                <input required type="text" value={editingPeriod.time} onChange={e => setEditingPeriod({...editingPeriod, time: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Subject</label>
                <input required type="text" value={editingPeriod.subject} onChange={e => setEditingPeriod({...editingPeriod, subject: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Teacher</label>
                <input type="text" value={editingPeriod.teacher || ''} onChange={e => setEditingPeriod({...editingPeriod, teacher: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>Update Period</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
