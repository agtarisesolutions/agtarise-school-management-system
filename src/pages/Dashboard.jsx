import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  CreditCard, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CalendarCheck,
  Download,
  BookOpen,
  Award,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const StatCard = ({ icon, label, value, change, isPositive }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-card"
    style={{ padding: '1.5rem', flex: 1, minWidth: '240px' }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <div style={{ 
        padding: '0.75rem', 
        background: 'var(--glass-bg)', 
        borderRadius: 'var(--radius-md)',
        color: 'var(--primary-color)'
      }}>
        {icon}
      </div>
      {change && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.25rem', 
          fontSize: '0.8rem',
          color: isPositive ? 'var(--success)' : 'var(--error)',
          background: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          padding: '0.2rem 0.5rem',
          borderRadius: 'var(--radius-full)'
        }}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
        </div>
      )}
    </div>
    <h3 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{value}</h3>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{label}</p>
  </motion.div>
);

const AdminDashboard = ({ user, exportDashboard }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
      <StatCard icon={<Users size={24} />} label="Total Students" value="1,284" change="+12%" isPositive={true} />
      <StatCard icon={<GraduationCap size={24} />} label="Total Teachers" value="86" change="+3%" isPositive={true} />
      <StatCard icon={<CreditCard size={24} />} label="Fees Collected" value="₦4.2M" change="-5%" isPositive={false} />
      <StatCard icon={<TrendingUp size={24} />} label="Academic Perf." value="84%" change="+8%" isPositive={true} />
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Recent Enrollments</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '1rem' }}>Student Name</th>
              <th style={{ padding: '1rem' }}>Class</th>
              <th style={{ padding: '1rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {[{ name: 'John Doe', class: 'SS3 A', status: 'Active' }, { name: 'Jane Smith', class: 'JSS2 B', status: 'Pending' }].map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem' }}>{row.name}</td>
                <td style={{ padding: '1rem' }}>{row.class}</td>
                <td style={{ padding: '1rem' }}>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Quick Actions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button className="btn-primary" style={{ justifyContent: 'center' }}>Admit Student</button>
          <button className="btn-primary" style={{ justifyContent: 'center', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>Disburse Salaries</button>
        </div>
      </div>
    </div>
  </div>
);

const TeacherDashboard = ({ user }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
      <StatCard icon={<Users size={24} />} label="Assigned Students" value="120" />
      <StatCard icon={<BookOpen size={24} />} label="Total Classes" value="4" />
      <StatCard icon={<CalendarCheck size={24} />} label="Today's Lessons" value="3" />
      <StatCard icon={<Award size={24} />} label="Class Average" value="72%" />
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Today's Timetable</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[{ time: '08:00', subject: 'Mathematics (SS3 A)' }, { time: '10:30', subject: 'Further Math (SS2 B)' }].map((item, i) => (
            <div key={i} style={{ padding: '1rem', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between' }}>
              <span>{item.subject}</span>
              <span style={{ color: 'var(--primary-color)', fontWeight: '700' }}>{item.time}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Pending Grades</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>You have 45 scripts to grade for Second Term Mathematics.</p>
        <button className="btn-primary">Open Gradebook</button>
      </div>
    </div>
  </div>
);

const StudentParentDashboard = ({ user }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
      <StatCard icon={<TrendingUp size={24} />} label="Current GPA" value="4.2/5.0" />
      <StatCard icon={<CalendarCheck size={24} />} label="Attendance" value="98%" />
      <StatCard icon={<CreditCard size={24} />} label="Fees Status" value="Paid" />
      <StatCard icon={<Award size={24} />} label="Rank in Class" value="3rd" />
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Upcoming Exams</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[{ date: 'May 12', subject: 'Mathematics' }, { date: 'May 14', subject: 'Physics' }].map((item, i) => (
            <div key={i} style={{ padding: '1rem', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between' }}>
              <span>{item.subject}</span>
              <span style={{ color: 'var(--secondary-color)', fontWeight: '700' }}>{item.date}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>School Notices</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--primary-color)', fontWeight: '700' }}>May 01:</span> Mid-term break begins.
          </div>
          <div style={{ fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--primary-color)', fontWeight: '700' }}>May 10:</span> PTA General Meeting.
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();

  const exportDashboard = () => {
    const doc = new jsPDF();
    doc.text(`${user?.schoolName || 'School'} - Dashboard Overview`, 14, 15);
    doc.autoTable({
      head: [['Metric', 'Value']],
      body: [
        ['Total Students', '1,284'],
        ['Total Teachers', '86'],
        ['Fees Collected', '₦4.2M'],
        ['Academic Performance', '84%'],
      ],
      startY: 25,
    });
    doc.save('dashboard_overview.pdf');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{user?.role?.toUpperCase()} <span className="text-gradient">Dashboard</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.name}! Manage your {user?.schoolName} experience.</p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={exportDashboard} className="btn-primary" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'white' }}>
            <Download size={18} /> Export Overview
          </button>
        )}
      </div>

      {user?.role === 'admin' && <AdminDashboard user={user} exportDashboard={exportDashboard} />}
      {user?.role === 'teacher' && <TeacherDashboard user={user} />}
      {(user?.role === 'student' || user?.role === 'parent') && <StudentParentDashboard user={user} />}
      
      <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid var(--primary-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Bell size={24} color="var(--primary-color)" />
          <div>
            <h4 style={{ color: 'var(--primary-color)' }}>Important Announcement</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>The inter-house sports competition has been rescheduled to May 25th. Please check the timetable for details.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
