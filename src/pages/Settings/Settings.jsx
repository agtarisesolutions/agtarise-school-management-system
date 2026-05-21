import React, { useState } from 'react';
import { School, Bell, Shield, Globe, Save, Moon, Sun, Lock, Key, Mail, Smartphone, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [theme, setTheme] = useState('dark');

  const handleSave = (e) => {
    e.preventDefault();
    alert('Settings updated successfully!');
  };

  const inputStyle = {
    padding: '0.75rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-md)', color: 'white', outline: 'none', width: '100%'
  };

  const tabs = [
    { id: 'profile', icon: <School size={18} />, label: 'School Profile' },
    { id: 'notifications', icon: <Bell size={18} />, label: 'Notifications' },
    { id: 'security', icon: <Shield size={18} />, label: 'Security & Access' },
    { id: 'regional', icon: <Globe size={18} />, label: 'Regional Settings' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>System <span className="text-gradient">Settings</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>Configure your school profile, security, and notification preferences.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {tabs.map((tab) => (
            <div 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', 
                background: activeTab === tab.id ? 'var(--glass-bg)' : 'transparent',
                border: activeTab === tab.id ? '1px solid var(--glass-border)' : '1px solid transparent',
                borderRadius: 'var(--radius-md)', cursor: 'pointer',
                color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                transition: 'all 0.3s ease'
              }}
            >
              {tab.icon}
              <span style={{ fontWeight: activeTab === tab.id ? '600' : '400' }}>{tab.label}</span>
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            
            {activeTab === 'profile' && (
              <>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><School size={20} color="var(--primary-color)" /> School Profile</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div><label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>School Name</label><input type="text" defaultValue={user?.schoolName || 'Agtarise Academy'} style={inputStyle} /></div>
                  <div><label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>School Code</label><input type="text" defaultValue="AGT-2024-X" style={inputStyle} /></div>
                </div>
                <div><label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Primary Contact Email</label><input type="email" defaultValue="admin@agtariseacademy.com" style={inputStyle} /></div>
                <div><label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>School Address</label><textarea rows="3" defaultValue="123 Education Way, Lagos, Nigeria" style={{...inputStyle, resize: 'none'}}></textarea></div>
              </>
            )}

            {activeTab === 'notifications' && (
              <>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Bell size={20} color="var(--primary-color)" /> Notification Preferences</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><Mail size={20} color="var(--text-muted)" /><div><h4>Email Alerts</h4><p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Receive daily system summaries via email</p></div></div>
                    <input type="checkbox" defaultChecked style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary-color)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><Smartphone size={20} color="var(--text-muted)" /><div><h4>SMS Notifications</h4><p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Send SMS to parents for fee reminders and absence</p></div></div>
                    <input type="checkbox" defaultChecked style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary-color)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><Bell size={20} color="var(--text-muted)" /><div><h4>In-App Push</h4><p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Instant notifications on the dashboard</p></div></div>
                    <input type="checkbox" defaultChecked style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary-color)' }} />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'security' && (
              <>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Shield size={20} color="var(--primary-color)" /> Security & Access</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div><label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Current Password</label><input type="password" placeholder="••••••••" style={inputStyle} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div><label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>New Password</label><input type="password" placeholder="••••••••" style={inputStyle} /></div>
                    <div><label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Confirm New Password</label><input type="password" placeholder="••••••••" style={inputStyle} /></div>
                  </div>
                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><Lock size={20} color="var(--text-muted)" /><div><h4>Two-Factor Authentication</h4><p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Require 2FA for admin accounts</p></div></div>
                    <button type="button" className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>Enable 2FA</button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'regional' && (
              <>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Globe size={20} color="var(--primary-color)" /> Regional Settings</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>System Timezone</label>
                    <select style={inputStyle} defaultValue="Africa/Lagos">
                      <option value="Africa/Lagos">West Africa Time (WAT) - Lagos</option>
                      <option value="GMT">Greenwich Mean Time (GMT)</option>
                      <option value="UTC">Coordinated Universal Time (UTC)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Currency</label>
                    <select style={inputStyle} defaultValue="NGN">
                      <option value="NGN">Nigerian Naira (₦)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="GBP">British Pound (£)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Date Format</label>
                    <select style={inputStyle} defaultValue="DD/MM/YYYY">
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Academic Year</label>
                    <select style={inputStyle} defaultValue="2024/2025">
                      <option value="2023/2024">2023/2024</option>
                      <option value="2024/2025">2024/2025</option>
                      <option value="2025/2026">2025/2026</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Appearance</span>
                <div style={{ display: 'flex', background: 'var(--glass-bg)', padding: '0.25rem', borderRadius: 'var(--radius-full)' }}>
                  <button type="button" onClick={() => setTheme('dark')} style={{ padding: '0.4rem 0.8rem', background: theme === 'dark' ? 'var(--primary-color)' : 'transparent', borderRadius: 'var(--radius-full)', border: 'none', color: theme === 'dark' ? 'white' : 'var(--text-muted)', cursor: 'pointer' }}><Moon size={16} /></button>
                  <button type="button" onClick={() => setTheme('light')} style={{ padding: '0.4rem 0.8rem', background: theme === 'light' ? 'var(--primary-color)' : 'transparent', borderRadius: 'var(--radius-full)', border: 'none', color: theme === 'light' ? 'white' : 'var(--text-muted)', cursor: 'pointer' }}><Sun size={16} /></button>
                </div>
              </div>
              <button type="submit" className="btn-primary">
                <Save size={18} /> Save Preferences
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
