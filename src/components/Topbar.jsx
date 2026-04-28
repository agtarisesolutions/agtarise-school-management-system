import React from 'react';
import { Bell, Search, User as UserIcon, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Topbar = () => {
  const { user } = useAuth();

  return (
    <header style={{
      height: '70px',
      position: 'fixed',
      top: 0,
      right: 0,
      left: '260px',
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'var(--glass-blur)',
      borderBottom: '1px solid var(--glass-border)',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 90
    }}>
      <div style={{ position: 'relative', width: '300px' }}>
        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
        <input 
          type="text" 
          placeholder="Search everything..."
          style={{
            width: '100%',
            padding: '0.6rem 1rem 0.6rem 2.8rem',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-full)',
            color: 'white',
            outline: 'none',
            fontSize: '0.9rem'
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={20} color="var(--text-muted)" />
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '8px',
            height: '8px',
            background: 'var(--error)',
            borderRadius: '50%',
            border: '2px solid var(--bg-dark)'
          }}></span>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          padding: '0.4rem 0.8rem', 
          background: 'var(--glass-bg)', 
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--glass-border)',
          cursor: 'pointer'
        }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            background: 'var(--primary-color)', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <UserIcon size={18} color="white" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{user?.name}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.role?.toUpperCase()}</span>
          </div>
          <ChevronDown size={16} color="var(--text-muted)" />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
