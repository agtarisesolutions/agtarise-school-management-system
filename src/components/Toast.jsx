import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const error   = useCallback((msg) => addToast(msg, 'error'), [addToast]);
  const info    = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  const icons = {
    success: <CheckCircle size={18} />,
    error:   <XCircle size={18} />,
    info:    <AlertCircle size={18} />,
  };

  const colors = {
    success: { bg: 'rgba(16,185,129,0.15)', border: '#10b981', icon: '#10b981' },
    error:   { bg: 'rgba(239,68,68,0.15)',  border: '#ef4444', icon: '#ef4444' },
    info:    { bg: 'rgba(99,102,241,0.15)', border: '#6366f1', icon: '#6366f1' },
  };

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      <div style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem',
        display: 'flex', flexDirection: 'column', gap: '0.75rem', zIndex: 9999
      }}>
        {toasts.map(toast => {
          const c = colors[toast.type];
          return (
            <div key={toast.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.85rem 1.25rem',
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderRadius: '12px',
              backdropFilter: 'blur(12px)',
              boxShadow: `0 8px 32px rgba(0,0,0,0.3)`,
              minWidth: '280px', maxWidth: '420px',
              animation: 'slideInRight 0.3s ease',
              color: 'white', fontSize: '0.9rem'
            }}>
              <span style={{ color: c.icon, flexShrink: 0 }}>{icons[toast.type]}</span>
              <span style={{ flex: 1 }}>{toast.message}</span>
              <button onClick={() => removeToast(toast.id)} style={{
                background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center'
              }}><X size={16} /></button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
