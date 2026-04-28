import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const MainLayout = ({ children }) => {
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
