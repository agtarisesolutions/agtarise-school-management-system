import React from 'react';
import { UserPlus, Search, Mail, Phone, BookOpen, MoreVertical, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const StaffList = () => {
  const staff = [
    { 
      id: 'STF001', 
      name: 'Dr. Smith', 
      role: 'Principal', 
      subject: 'Administration', 
      email: 'smith@school.com', 
      phone: '08123456789',
      dob: '1975-05-12',
      maritalStatus: 'Married',
      address: '45 Principal Way, Lagos',
      nextOfKin: { name: 'Mrs. Jane Smith', phone: '08098765432', address: '45 Principal Way, Lagos' },
      nationality: 'Nigerian'
    },
    { 
      id: 'STF002', 
      name: 'Mrs. Adebayo', 
      role: 'Teacher', 
      subject: 'Mathematics', 
      email: 'adebayo@school.com', 
      phone: '08134567890',
      dob: '1988-10-22',
      maritalStatus: 'Married',
      address: '12 Teacher Lane, Lagos',
      nextOfKin: { name: 'Mr. Adebayo', phone: '08087654321', address: '12 Teacher Lane, Lagos' },
      nationality: 'Nigerian'
    },
    { 
      id: 'STF003', 
      name: 'Mr. Okoro', 
      role: 'Teacher', 
      subject: 'English', 
      email: 'okoro@school.com', 
      phone: '08145678901',
      dob: '1992-03-15',
      maritalStatus: 'Single',
      address: '7 Hilltop Street, Enugu',
      nextOfKin: { name: 'Grace Okoro', phone: '08076543210', address: '7 Hilltop Street, Enugu' },
      nationality: 'Nigerian'
    },
  ];

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Staff Directory Report', 14, 15);
    const tableData = staff.map(s => [s.id, s.name, s.role, s.subject, s.email]);
    doc.autoTable({
      head: [['ID', 'Name', 'Role', 'Department', 'Email']],
      body: tableData,
      startY: 20,
    });
    doc.save('staff_directory.pdf');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Staff <span className="text-gradient">Directory</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage teachers, administrative staff, and payroll access.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={generatePDF} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.75rem 1.25rem', 
            background: 'var(--glass-bg)', 
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            color: 'white',
            cursor: 'pointer'
          }}>
            <Download size={18} /> Export List
          </button>
          <button className="btn-primary">
            <UserPlus size={20} /> Add New Staff
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {staff.map((member) => (
          <div key={member.id} className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '12px', 
                  background: 'var(--primary-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '700'
                }}>
                  {member.name.split(' ')[1].charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem' }}>{member.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: '600' }}>{member.role}</span>
                </div>
              </div>
              <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <MoreVertical size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <BookOpen size={16} />
                <span>{member.subject}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <Mail size={16} />
                <span>{member.email}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>DOB:</span> {member.dob}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Status:</span> {member.maritalStatus}</div>
              </div>
              <div style={{ fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Address:</span> {member.address}
              </div>
              <div style={{ fontSize: '0.8rem', padding: '0.5rem', background: 'var(--glass-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                <span style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Next of Kin:</span> {member.nextOfKin.name}
                <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)' }}>
                  Phone: {member.nextOfKin.phone}<br />
                  Addr: {member.nextOfKin.address}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{ 
                flex: 1, 
                padding: '0.5rem', 
                background: 'var(--glass-bg)', 
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                color: 'white',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}>View Profile</button>
              <button style={{ 
                flex: 1, 
                padding: '0.5rem', 
                background: 'rgba(99, 102, 241, 0.1)', 
                border: '1px solid var(--primary-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--primary-color)',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}>Send Message</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaffList;
