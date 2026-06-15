import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Filter, Edit2, Mail, Phone, MapPin, Download, Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const StudentList = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '', class: '', gender: 'Male', parent: '', phone: '', status: 'Active', passportUrl: '',
    dob: '', nin: '', nationality: 'Nigerian', religion: '', stateOfOrigin: '', homeAddress: '', 
    guardianEmail: '', fathersName: '', mothersName: '', previousAcademicRecords: ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await updateDoc(doc(db, "students", editingStudent.id), formData);
      } else {
        await addDoc(collection(db, "students"), {
          ...formData,
          createdAt: new Date().toISOString(),
          studentId: `STU${Math.floor(1000 + Math.random() * 9000)}`
        });
      }
      closeModal();
      fetchStudents();
    } catch (error) {
      console.error("Error saving student: ", error);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || '',
      class: student.class || '',
      gender: student.gender || 'Male',
      parent: student.parent || '',
      phone: student.phone || '',
      status: student.status || 'Active',
      passportUrl: student.passportUrl || '',
      dob: student.dob || '', nin: student.nin || '', nationality: student.nationality || 'Nigerian', 
      religion: student.religion || '', stateOfOrigin: student.stateOfOrigin || '', homeAddress: student.homeAddress || '', 
      guardianEmail: student.guardianEmail || '', fathersName: student.fathersName || '', mothersName: student.mothersName || '', 
      previousAcademicRecords: student.previousAcademicRecords || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStudent(null);
    setFormData({ 
      name: '', class: '', gender: 'Male', parent: '', phone: '', status: 'Active', passportUrl: '',
      dob: '', nin: '', nationality: 'Nigerian', religion: '', stateOfOrigin: '', homeAddress: '', 
      guardianEmail: '', fathersName: '', mothersName: '', previousAcademicRecords: ''
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `students/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, passportUrl: url }));
    } catch (err) {
      console.error("Error uploading image: ", err);
      alert("Failed to upload image. Please check your storage rules.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteDoc(doc(db, "students", id));
        fetchStudents();
      } catch (error) {
        console.error("Error deleting student: ", error);
      }
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Student Registry Report', 14, 15);
    const tableData = filteredStudents.map(s => [s.studentId, s.name, s.class, s.gender, s.parent, s.status]);
    autoTable(doc, {
      head: [['ID', 'Name', 'Class', 'Gender', 'Parent', 'Status']],
      body: tableData,
      startY: 20,
      theme: 'grid',
      headStyles: { fillStyle: '#6366f1' }
    });
    doc.save('student_registry.pdf');
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (s.studentId && s.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         s.class.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Role-based filtering: Teachers only see their assigned class
    if (user?.role === 'teacher' && user?.assignedClass) {
      return matchesSearch && s.class === user.assignedClass;
    }
    
    return matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Student <span className="text-gradient">Registry</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {user?.role === 'teacher' ? `Managing records for ${user.assignedClass}` : 'Manage student profiles, admissions, and academic history.'}
          </p>
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
          <button className="btn-primary" onClick={() => setShowModal(true)}>
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
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
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
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {stu.passportUrl ? <img src={stu.passportUrl} alt={stu.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (stu.name ? stu.name.charAt(0) : '?')}
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
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button onClick={() => handleEdit(stu)} style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}>
                          <Edit2 size={18} />
                        </button>
                        {user?.role === 'admin' && (
                          <button onClick={() => handleDelete(stu.id)} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '1.5rem' }}>{editingStudent ? 'Edit Student Profile' : 'Admit New Student'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Passport Photo</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {formData.passportUrl && (
                      <div style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden' }}>
                        <img src={formData.passportUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ flex: 1, padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} disabled={uploadingImage} />
                    {uploadingImage && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Uploading...</span>}
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-color)', margin: '0.5rem 0' }}>Personal Information</h3>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Full Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Class to which admission is sought</label>
                  <input required type="text" value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Gender</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Date of Birth</label>
                  <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>NIN</label>
                  <input type="text" value={formData.nin} onChange={e => setFormData({...formData, nin: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nationality</label>
                  <input type="text" value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Religion</label>
                  <input type="text" value={formData.religion} onChange={e => setFormData({...formData, religion: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>State of Origin</label>
                  <input type="text" value={formData.stateOfOrigin} onChange={e => setFormData({...formData, stateOfOrigin: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Home Address</label>
                  <textarea value={formData.homeAddress} onChange={e => setFormData({...formData, homeAddress: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', minHeight: '60px' }} />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-color)', margin: '0.5rem 0' }}>Family Information</h3>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Father's Name</label>
                  <input type="text" value={formData.fathersName} onChange={e => setFormData({...formData, fathersName: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Mother's Name</label>
                  <input type="text" value={formData.mothersName} onChange={e => setFormData({...formData, mothersName: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Guardian Name</label>
                  <input required type="text" value={formData.parent} onChange={e => setFormData({...formData, parent: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Guardian Phone</label>
                  <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Guardian Email</label>
                  <input type="email" value={formData.guardianEmail} onChange={e => setFormData({...formData, guardianEmail: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-color)', margin: '0.5rem 0' }}>Academic Information</h3>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Previous Academic Records</label>
                  <textarea value={formData.previousAcademicRecords} onChange={e => setFormData({...formData, previousAcademicRecords: e.target.value})} placeholder="Previous schools attended, grades, etc." style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', minHeight: '60px' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '1rem', justifyContent: 'center' }} disabled={uploadingImage}>
                {editingStudent ? 'Update Profile' : 'Save Admission'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;
