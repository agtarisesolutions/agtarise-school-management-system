import React, { useState } from 'react';
import { Bell, Search, User as UserIcon, ChevronDown, LogOut, Settings as SettingsIcon, UserCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Topbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // For now, we'll just alert or navigate to a search results page if one exists
      // Since it doesn't, let's just log it
      console.log('Searching for:', searchQuery);
      // Optional: navigate(`/search?q=${searchQuery}`);
    }
  };

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
      <form onSubmit={handleSearch} style={{ position: 'relative', width: '300px' }}>
        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
        <input 
          type="text" 
          placeholder="Search everything..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem 2.8rem 0.6rem 2.8rem',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-full)',
            color: 'white',
            outline: 'none',
            fontSize: '0.9rem'
          }}
        />
        {searchQuery && (
          <X 
            size={16} 
            style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', cursor: 'pointer' }} 
            onClick={() => setSearchQuery('')}
          />
        )}
      </form>

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

        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              padding: '0.4rem 0.8rem', 
              background: 'var(--glass-bg)', 
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--glass-border)',
              cursor: 'pointer'
            }}
          >
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
            <ChevronDown size={16} color="var(--text-muted)" style={{ transform: showDropdown ? 'rotate(180deg)' : 'none', transition: 'var(--transition-fast)' }} />
          </div>

          {showDropdown && (
            <>
              <div 
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }} 
                onClick={() => setShowDropdown(false)}
              />
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 0.5rem)',
                right: 0,
                width: '200px',
                background: 'var(--bg-dark)',
                backdropFilter: 'var(--glass-blur)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem',
                boxShadow: 'var(--card-shadow)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                zIndex: 100
              }}>
                <button 
                  onClick={() => { navigate('/settings'); setShowDropdown(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', 
                    borderRadius: 'var(--radius-sm)', background: 'transparent', border: 'none', 
                    color: 'var(--text-main)', cursor: 'pointer', textAlign: 'left', transition: 'var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--glass-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <UserCircle size={18} />
                  <span style={{ fontSize: '0.9rem' }}>Profile</span>
                </button>
                <button 
                  onClick={() => { navigate('/settings'); setShowDropdown(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', 
                    borderRadius: 'var(--radius-sm)', background: 'transparent', border: 'none', 
                    color: 'var(--text-main)', cursor: 'pointer', textAlign: 'left', transition: 'var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--glass-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <SettingsIcon size={18} />
                  <span style={{ fontSize: '0.9rem' }}>Settings</span>
                </button>
                <div style={{ height: '1px', background: 'var(--glass-border)', margin: '0.25rem 0' }} />
                <button 
                  onClick={logout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', 
                    borderRadius: 'var(--radius-sm)', background: 'transparent', border: 'none', 
                    color: 'var(--error)', cursor: 'pointer', textAlign: 'left', transition: 'var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={18} />
                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
