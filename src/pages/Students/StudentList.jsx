import React, { useState } from 'react';
import { UserPlus, Search, Filter, MoreHorizontal, Mail, Phone, MapPin, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const StudentList = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const students = [
    { id: 'STU001', name: 'Chinedu Eze', class: 'SS3 A', gender: 'Male', status: 'Active', parent: 'Mr. Eze', phone: '08012345678' },
    { id: 'STU002', name: 'Fatima Ibrahim', class: 'JSS2 B', gender: 'Female', status: 'Active', parent: 'Mrs. Ibrahim', phone: '08023456789' },
    { id: 'STU003', name: 'Oluwaseun Ade', class: 'Primary 5', gender: 'Male', status: 'Active', parent: 'Mr. Ade', phone: '08034567890' },
    { id: 'STU004', name: 'Ngozi Okoro', class: 'SS1 C', gender: 'Female', status: 'Inactive', parent: 'Mrs. Okoro', phone: '08045678901' },
    { id: 'STU005', name: 'Kelechi Nwosu', class: 'Nursery 2', gender: 'Male', status: 'Active', parent: 'Mr. Nwosu', phone: '08056789012' },
  ];

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Student Registry Report', 14, 15);
    const tableData = students.map(s => [s.id, s.name, s.class, s.gender, s.parent, s.status]);
    doc.autoTable({
      head: [['ID', 'Name', 'Class', 'Gender', 'Parent', 'Status']],
      body: tableData,
      startY: 20,
    });
    doc.save('student_registry.pdf');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Student <span className="text-gradient">Registry</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage student profiles, admissions, and academic history.</p>
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
            <UserPlus size={20} /> Admit Student
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '350px' }}>
            <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
            <input 
              type="text" 
              placeholder="Search by name, ID or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem 0.6rem 2.2rem',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>
          <button style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.6rem 1rem', 
            background: 'var(--glass-bg)', 
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            color: 'white',
            cursor: 'pointer'
          }}>
            <Filter size={16} /> Filter
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem' }}>ID</th>
                <th style={{ padding: '1rem' }}>Student Name</th>
                <th style={{ padding: '1rem' }}>Class</th>
                <th style={{ padding: '1rem' }}>Gender</th>
                <th style={{ padding: '1rem' }}>Parent/Guardian</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((stu) => (
                <tr key={stu.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '600' }}>{stu.id}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                        {stu.name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: '500' }}>{stu.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>{stu.class}</td>
                  <td style={{ padding: '1rem' }}>{stu.gender}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.9rem' }}>{stu.parent}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stu.phone}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.2rem 0.6rem', 
                      borderRadius: 'var(--radius-full)', 
                      fontSize: '0.75rem',
                      background: stu.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: stu.status === 'Active' ? 'var(--success)' : 'var(--error)'
                    }}>
                      {stu.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentList;
