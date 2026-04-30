import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Filter, MoreHorizontal, Mail, Phone, MapPin, Download, Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

const StudentList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '', class: '', gender: 'Male', parent: '', phone: ''
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "students"));
      const studentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching students: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "students"), {
        ...newStudent,
        status: 'Active',
        createdAt: new Date().toISOString(),
        studentId: `STU${Math.floor(1000 + Math.random() * 9000)}` // Generate random ID
      });
      setShowAddModal(false);
      setNewStudent({ name: '', class: '', gender: 'Male', parent: '', phone: '' });
      fetchStudents(); // Refresh list
    } catch (error) {
      console.error("Error adding student: ", error);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteDoc(doc(db, "students", id));
        fetchStudents(); // Refresh list
      } catch (error) {
        console.error("Error deleting student: ", error);
      }
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Student Registry Report', 14, 15);
    const tableData = students.map(s => [s.studentId, s.name, s.class, s.gender, s.parent, s.status]);
    doc.autoTable({
      head: [['ID', 'Name', 'Class', 'Gender', 'Parent', 'Status']],
      body: tableData,
      startY: 20,
    });
    doc.save('student_registry.pdf');
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.studentId && s.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
    s.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
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
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading students...</div>
          ) : (
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
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No students found in database. Admit a new student.</td>
                  </tr>
                ) : filteredStudents.map((stu) => (
                  <tr key={stu.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '600' }}>{stu.studentId}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                          {stu.name ? stu.name.charAt(0) : '?'}
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
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button onClick={() => handleDelete(stu.id)} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setShowAddModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '1.5rem' }}>Admit New Student</h2>
            <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Full Name</label>
                <input required type="text" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Class</label>
                <input required type="text" placeholder="e.g. SS3 A" value={newStudent.class} onChange={e => setNewStudent({...newStudent, class: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Gender</label>
                <select value={newStudent.gender} onChange={e => setNewStudent({...newStudent, gender: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Parent/Guardian Name</label>
                <input required type="text" value={newStudent.parent} onChange={e => setNewStudent({...newStudent, parent: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Parent/Guardian Phone</label>
                <input required type="text" value={newStudent.phone} onChange={e => setNewStudent({...newStudent, phone: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '1rem', justifyContent: 'center' }}>Save Student</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;
