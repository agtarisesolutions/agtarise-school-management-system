import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Mail, Phone, BookOpen, MoreVertical, Download, X, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

const StaffList = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '', role: 'Teacher', subject: '', email: '', phone: '',
    dob: '', maritalStatus: 'Single', address: '', nationality: 'Nigerian',
    nextOfKinName: '', nextOfKinPhone: '', nextOfKinAddress: ''
  });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "staff"));
      const staffData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStaff(staffData);
    } catch (error) {
      console.error("Error fetching staff: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      // Re-structure next of kin to match previous structure
      const staffDataToSave = {
        name: newStaff.name,
        role: newStaff.role,
        subject: newStaff.subject,
        email: newStaff.email,
        phone: newStaff.phone,
        dob: newStaff.dob,
        maritalStatus: newStaff.maritalStatus,
        address: newStaff.address,
        nationality: newStaff.nationality,
        nextOfKin: {
          name: newStaff.nextOfKinName,
          phone: newStaff.nextOfKinPhone,
          address: newStaff.nextOfKinAddress
        },
        staffId: `STF${Math.floor(1000 + Math.random() * 9000)}`
      };

      await addDoc(collection(db, "staff"), staffDataToSave);
      setShowAddModal(false);
      setNewStaff({
        name: '', role: 'Teacher', subject: '', email: '', phone: '',
        dob: '', maritalStatus: 'Single', address: '', nationality: 'Nigerian',
        nextOfKinName: '', nextOfKinPhone: '', nextOfKinAddress: ''
      });
      fetchStaff();
    } catch (error) {
      console.error("Error adding staff: ", error);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to remove this staff member?")) {
      try {
        await deleteDoc(doc(db, "staff", id));
        fetchStaff();
      } catch (error) {
        console.error("Error deleting staff: ", error);
      }
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Staff Directory Report', 14, 15);
    const tableData = staff.map(s => [s.staffId || s.id, s.name, s.role, s.subject, s.email]);
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
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <UserPlus size={20} /> Add New Staff
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading staff...</div>
      ) : staff.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No staff members found in database.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {staff.map((member) => (
            <div key={member.id} className="glass-card" style={{ padding: '1.5rem', position: 'relative' }}>
              <button 
                onClick={() => handleDelete(member.id)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
              >
                <Trash2 size={16} />
              </button>
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
                    {member.name ? member.name.charAt(0) : '?'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', paddingRight: '1.5rem' }}>{member.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: '600' }}>{member.role}</span>
                  </div>
                </div>
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
                {member.nextOfKin && (
                  <div style={{ fontSize: '0.8rem', padding: '0.5rem', background: 'var(--glass-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                    <span style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Next of Kin:</span> {member.nextOfKin.name}
                    <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-muted)' }}>
                      Phone: {member.nextOfKin.phone}<br />
                      Addr: {member.nextOfKin.address}
                    </div>
                  </div>
                )}
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
      )}

      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setShowAddModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '1.5rem' }}>Add New Staff</h2>
            <form onSubmit={handleAddStaff} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Full Name</label>
                <input required type="text" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Role</label>
                <select value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }}>
                  <option value="Teacher">Teacher</option>
                  <option value="Principal">Principal</option>
                  <option value="Admin">Admin</option>
                  <option value="Accountant">Accountant</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Subject/Department</label>
                <input type="text" value={newStaff.subject} onChange={e => setNewStaff({...newStaff, subject: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email</label>
                <input required type="email" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Phone Number</label>
                <input required type="text" value={newStaff.phone} onChange={e => setNewStaff({...newStaff, phone: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <h3 style={{ fontSize: '1rem', marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Next of Kin Details</h3>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>NOK Name</label>
                <input required type="text" value={newStaff.nextOfKinName} onChange={e => setNewStaff({...newStaff, nextOfKinName: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>NOK Phone</label>
                <input required type="text" value={newStaff.nextOfKinPhone} onChange={e => setNewStaff({...newStaff, nextOfKinPhone: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Save Staff Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffList;
