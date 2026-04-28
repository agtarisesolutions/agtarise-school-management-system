import React from 'react';
import { Calendar, Clock, BookOpen, User, Download, Plus } from 'lucide-react';

const Timetable = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [
    { time: '08:00 - 08:40', subject: 'Mathematics', teacher: 'Mrs. Adebayo' },
    { time: '08:40 - 09:20', subject: 'English', teacher: 'Mr. Okoro' },
    { time: '09:20 - 10:00', subject: 'Physics', teacher: 'Miss Chima' },
    { time: '10:00 - 10:30', subject: 'BREAK', teacher: '-' },
    { time: '10:30 - 11:10', subject: 'Chemistry', teacher: 'Dr. Smith' },
    { time: '11:10 - 11:50', subject: 'Biology', teacher: 'Mrs. Adebayo' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Class <span className="text-gradient">Timetable</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Weekly schedule for academic activities and examinations.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'white' }}>
            <Download size={18} /> Export Timetable
          </button>
          <button className="btn-primary">
            <Plus size={18} /> Add Period
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
        {days.map(day => (
          <button key={day} style={{ 
            padding: '0.6rem 1.5rem', 
            background: day === 'Monday' ? 'var(--primary-color)' : 'var(--glass-bg)', 
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {periods.map((period, i) => (
            <div key={i} style={{ 
              padding: '1.5rem', 
              background: period.subject === 'BREAK' ? 'rgba(245, 158, 11, 0.05)' : 'var(--glass-bg)', 
              borderRadius: 'var(--radius-md)', 
              border: period.subject === 'BREAK' ? '1px dashed var(--warning)' : '1px solid var(--glass-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: '700' }}>
                  <Clock size={16} />
                  {period.time}
                </div>
                {period.subject !== 'BREAK' && <BookOpen size={16} color="var(--text-muted)" />}
              </div>
              <h3 style={{ fontSize: '1.25rem', color: period.subject === 'BREAK' ? 'var(--warning)' : 'white' }}>{period.subject}</h3>
              {period.subject !== 'BREAK' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <User size={14} />
                  {period.teacher}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timetable;
