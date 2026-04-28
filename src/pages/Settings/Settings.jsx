import React from 'react';
import { Settings as SettingsIcon, Bell, Shield, Globe, School, Save, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>System <span className="text-gradient">Settings</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>Configure your school profile, security, and notification preferences.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { icon: <School size={18} />, label: 'School Profile' },
            { icon: <Bell size={18} />, label: 'Notifications' },
            { icon: <Shield size={18} />, label: 'Security & Access' },
            { icon: <Globe size={18} />, label: 'Regional Settings' },
          ].map((item, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              padding: '1rem', 
              background: i === 0 ? 'var(--glass-bg)' : 'transparent',
              border: i === 0 ? '1px solid var(--glass-border)' : '1px solid transparent',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              color: i === 0 ? 'white' : 'var(--text-muted)'
            }}>
              {item.icon}
              <span style={{ fontWeight: i === 0 ? '600' : '400' }}>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <School size={20} color="var(--primary-color)" /> School Profile
          </h3>

          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>School Name</label>
                <input 
                  type="text" 
                  defaultValue={user?.schoolName}
                  style={{
                    padding: '0.75rem',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'white',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>School Code</label>
                <input 
                  type="text" 
                  defaultValue="AGT-2024-X"
                  style={{
                    padding: '0.75rem',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'white',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Primary Contact Email</label>
              <input 
                type="email" 
                defaultValue="admin@agtariseacademy.com"
                style={{
                  padding: '0.75rem',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'white',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>School Address</label>
              <textarea 
                rows="3"
                defaultValue="123 Education Way, Lagos, Nigeria"
                style={{
                  padding: '0.75rem',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'white',
                  outline: 'none',
                  resize: 'none'
                }}
              ></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Appearance</span>
                <div style={{ display: 'flex', background: 'var(--glass-bg)', padding: '0.25rem', borderRadius: 'var(--radius-full)' }}>
                  <button style={{ padding: '0.4rem 0.8rem', background: 'var(--primary-color)', borderRadius: 'var(--radius-full)', border: 'none', color: 'white' }}>
                    <Moon size={16} />
                  </button>
                  <button style={{ padding: '0.4rem 0.8rem', background: 'transparent', borderRadius: 'var(--radius-full)', border: 'none', color: 'var(--text-muted)' }}>
                    <Sun size={16} />
                  </button>
                </div>
              </div>
              <button className="btn-primary">
                <Save size={18} /> Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
