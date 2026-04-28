import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CreditCard, 
  Settings, 
  LogOut,
  GraduationCap,
  Calendar,
  BarChart3,
  Package,
  Wallet,
  Award,
  Book,
  CalendarDays
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  // Define all possible nav items
  const allNavItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'teacher', 'student', 'parent'] },
    { icon: <Users size={20} />, label: 'Students', path: '/students', roles: ['admin', 'teacher'] },
    { icon: <GraduationCap size={20} />, label: 'Staff', path: '/staff', roles: ['admin'] },
    { icon: <BookOpen size={20} />, label: 'Academics', path: '/academics', roles: ['admin', 'teacher'] },
    { icon: <Book size={20} />, label: 'Gradebook', path: '/gradebook', roles: ['admin', 'teacher'] },
    { icon: <CalendarDays size={20} />, label: 'Timetable', path: '/timetable', roles: ['admin', 'teacher', 'student', 'parent'] },
    { icon: <Award size={20} />, label: 'Results', path: '/results', roles: ['admin', 'teacher', 'student', 'parent'] },
    { icon: <Package size={20} />, label: 'Inventory', path: '/inventory', roles: ['admin'] },
    { icon: <Calendar size={20} />, label: 'Attendance', path: '/attendance', roles: ['admin', 'teacher', 'student', 'parent'] },
    { icon: <CreditCard size={20} />, label: 'Finance', path: '/finance', roles: ['admin', 'parent'] },
    { icon: <Wallet size={20} />, label: 'Payroll', path: '/payroll', roles: ['admin'] },
    { icon: <BarChart3 size={20} />, label: 'Reports', path: '/reports', roles: ['admin'] },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings', roles: ['admin'] },
  ];

  // Filter items based on user role
  const navItems = allNavItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside style={{
      width: '260px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      background: 'var(--bg-card)',
      backdropFilter: 'var(--glass-blur)',
      borderRight: '1px solid var(--glass-border)',
      padding: '2rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', padding: '0 1rem' }}>
        <div style={{ padding: '0.5rem', background: 'var(--primary-color)', borderRadius: 'var(--radius-md)' }}>
          <BookOpen size={24} color="white" />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Agtarise <span className="text-gradient">SMS</span></h2>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              color: isActive ? 'white' : 'var(--text-muted)',
              background: isActive ? 'var(--primary-color)' : 'transparent',
              transition: 'var(--transition-fast)',
              fontWeight: isActive ? '600' : '400'
            })}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
        <button 
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
            border: 'none',
            color: 'var(--error)',
            cursor: 'pointer',
            width: '100%',
            fontWeight: '600',
            textAlign: 'left'
          }}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
