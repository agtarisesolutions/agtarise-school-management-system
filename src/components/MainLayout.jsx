import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const MainLayout = ({ children }) => {
  useEffect(() => {
    const applyTheme = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'system', 'globalSettings'));
        if (docSnap.exists() && docSnap.data().themeColor) {
          document.documentElement.style.setProperty('--primary-color', docSnap.data().themeColor);
        }
      } catch (err) {
        console.error("Failed to load theme:", err);
      }
    };
    applyTheme();
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '260px' }}>
        <Topbar />
        <main style={{ padding: '90px 2rem 2rem 2rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
