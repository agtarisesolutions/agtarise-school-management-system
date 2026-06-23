import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, X, Edit2, Trash2, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const EVENT_TYPES = [
  { value: 'term-start', label: 'Term Start', color: '#6366f1' },
  { value: 'term-end', label: 'Term End', color: '#8b5cf6' },
  { value: 'exam', label: 'Examination', color: '#ef4444' },
  { value: 'holiday', label: 'Public Holiday', color: '#10b981' },
  { value: 'school-holiday', label: 'School Holiday', color: '#f59e0b' },
  { value: 'event', label: 'School Event', color: '#3b82f6' },
  { value: 'pta', label: 'PTA Meeting', color: '#ec4899' },
  { value: 'sports', label: 'Sports Day', color: '#14b8a6' },
  { value: 'cultural', label: 'Cultural Day', color: '#f97316' },
  { value: 'other', label: 'Other', color: '#94a3b8' },
];

const DEFAULT_EVENT = { title: '', type: 'event', startDate: '', endDate: '', description: '', session: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}` };

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const AcademicCalendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_EVENT);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState('All');
  const [view, setView] = useState('calendar'); // 'calendar' | 'list'

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'academic_calendar'), orderBy('startDate', 'asc'));
      const snap = await getDocs(q);
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error fetching calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await updateDoc(doc(db, 'academic_calendar', editingEvent.id), formData);
      } else {
        await addDoc(collection(db, 'academic_calendar'), { ...formData, createdAt: new Date().toISOString() });
      }
      alert('✅ Calendar event saved successfully!');
      setShowModal(false);
      setEditingEvent(null);
      setFormData(DEFAULT_EVENT);
      fetchEvents();
    } catch (err) { 
      console.error('Error saving event:', err); 
      alert('❌ Failed to save calendar event: ' + err.message);
    }
  };

  const handleEdit = (ev) => {
    setEditingEvent(ev);
    setFormData({ title: ev.title, type: ev.type, startDate: ev.startDate, endDate: ev.endDate || ev.startDate, description: ev.description || '', session: ev.session || DEFAULT_EVENT.session });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this event?')) {
      try {
        await deleteDoc(doc(db, 'academic_calendar', id));
        fetchEvents();
      } catch (err) {
        console.error('Error deleting calendar event:', err);
        alert('❌ Failed to delete calendar event: ' + err.message);
      }
    }
  };

  const getTypeInfo = (type) => EVENT_TYPES.find(t => t.value === type) || EVENT_TYPES[EVENT_TYPES.length - 1];

  // Calendar grid helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getEventsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(ev => {
      const start = ev.startDate;
      const end = ev.endDate || ev.startDate;
      return dateStr >= start && dateStr <= end;
    });
  };

  const printCalendar = () => {
    const rows = filteredEvents.map(ev => {
      const info = getTypeInfo(ev.type);
      return `<tr><td>${ev.title}</td><td style="color:${info.color}">${info.label}</td><td>${ev.startDate}</td><td>${ev.endDate || ev.startDate}</td><td>${ev.session}</td><td>${ev.description || '-'}</td></tr>`;
    }).join('');
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Academic Calendar</title><style>body{font-family:sans-serif;padding:40px;color:#1e293b}h1{color:#4f46e5}table{width:100%;border-collapse:collapse}th{background:#f1f5f9;padding:10px;text-align:left;border-bottom:2px solid #cbd5e1}td{padding:10px;border-bottom:1px solid #e2e8f0;font-size:13px}</style></head><body><h1>Academic Calendar</h1><table><thead><tr><th>Event</th><th>Type</th><th>Start</th><th>End</th><th>Session</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table><script>window.onload=()=>{window.print();setTimeout(()=>window.close(),500)}<\/script></body></html>`);
    win.document.close();
  };

  const filteredEvents = events.filter(ev => filterType === 'All' || ev.type === filterType);
  const inputStyle = { width: '100%', padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Academic <span className="text-gradient">Calendar</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>School events, term dates, holidays and examinations at a glance.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            {['calendar', 'list'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: '0.6rem 1.2rem', background: view === v ? 'var(--primary-color)' : 'transparent', border: 'none', color: 'white', cursor: 'pointer', textTransform: 'capitalize' }}>{v}</button>
            ))}
          </div>
          <button onClick={printCalendar} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', cursor: 'pointer' }}>
            <Download size={18} /> Print
          </button>
          {user?.role === 'admin' && (
            <button className="btn-primary" onClick={() => { setEditingEvent(null); setFormData(DEFAULT_EVENT); setShowModal(true); }}>
              <Plus size={20} /> Add Event
            </button>
          )}
        </div>
      </div>

      {/* Type filter badges */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => setFilterType('All')} style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--glass-border)', background: filterType === 'All' ? 'var(--primary-color)' : 'var(--glass-bg)', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}>All</button>
        {EVENT_TYPES.map(t => (
          <button key={t.value} onClick={() => setFilterType(t.value)} style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', border: `1px solid ${t.color}`, background: filterType === t.value ? t.color : 'transparent', color: 'white', cursor: 'pointer', fontSize: '0.8rem', opacity: filterType === t.value ? 1 : 0.75 }}>{t.label}</button>
        ))}
      </div>

      {/* CALENDAR VIEW */}
      {view === 'calendar' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <button onClick={() => setCurrentDate(new Date(year, month - 1))} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem', cursor: 'pointer' }}><ChevronLeft size={18} /></button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{MONTHS[month]} {year}</h2>
            <button onClick={() => setCurrentDate(new Date(year, month + 1))} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem', cursor: 'pointer' }}><ChevronRight size={18} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {DAYS.map(d => <div key={d} style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>{d}</div>)}
            {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const dayEvents = getEventsForDay(day);
              const today = new Date();
              const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
              return (
                <div key={day} style={{ minHeight: '80px', padding: '0.4rem', background: isToday ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.02)', borderRadius: '8px', border: isToday ? '1px solid var(--primary-color)' : '1px solid transparent' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: isToday ? '700' : '400', color: isToday ? 'var(--primary-color)' : 'white', marginBottom: '4px' }}>{day}</div>
                  {dayEvents.slice(0, 2).map(ev => {
                    const info = getTypeInfo(ev.type);
                    return (
                      <div key={ev.id} style={{ fontSize: '0.65rem', background: info.color + '33', color: info.color, borderRadius: '4px', padding: '2px 4px', marginBottom: '2px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontWeight: '600' }}>
                        {ev.title}
                      </div>
                    );
                  })}
                  {dayEvents.length > 2 && <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>+{dayEvents.length - 2} more</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <CalendarDays size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.4 }} />
              <p style={{ color: 'var(--text-muted)' }}>No events found. Add your first event.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredEvents.map(ev => {
                const info = getTypeInfo(ev.type);
                return (
                  <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: info.color + '11', borderRadius: 'var(--radius-md)', border: `1px solid ${info.color}44` }}>
                    <div style={{ width: '4px', height: '48px', background: info.color, borderRadius: '2px', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: '700', fontSize: '1rem' }}>{ev.title}</span>
                        <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', background: info.color + '33', color: info.color, fontWeight: '600' }}>{info.label}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {ev.startDate}{ev.endDate && ev.endDate !== ev.startDate ? ` → ${ev.endDate}` : ''} &nbsp;|&nbsp; Session: {ev.session}
                      </div>
                      {ev.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{ev.description}</div>}
                    </div>
                    {user?.role === 'admin' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleEdit(ev)} style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(ev.id)} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => { setShowModal(false); setEditingEvent(null); setFormData(DEFAULT_EVENT); }} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
            <h2 style={{ marginBottom: '1.5rem' }}>{editingEvent ? 'Edit Event' : 'Add Calendar Event'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Event Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} style={inputStyle} placeholder="e.g. First Term Examination" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Event Type</label>
                <select value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value }))} style={inputStyle}>
                  {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Start Date</label>
                  <input required type="date" value={formData.startDate} onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>End Date</label>
                  <input type="date" value={formData.endDate} onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Academic Session</label>
                <input type="text" value={formData.session} onChange={e => setFormData(p => ({ ...p, session: e.target.value }))} style={inputStyle} placeholder="2025/2026" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Notes / Description</label>
                <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} placeholder="Optional notes..." />
              </div>
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                <CalendarDays size={18} /> {editingEvent ? 'Update Event' : 'Add to Calendar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicCalendar;
