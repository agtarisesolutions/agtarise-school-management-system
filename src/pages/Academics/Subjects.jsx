import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Filter, Download, X, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '', code: '', level: 'General', classes: ''
  });

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "subjects"));
      const subjectData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSubjects(subjectData);
    } catch (error) {
      console.error("Error fetching subjects: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "subjects"), newSubject);
      setShowAddModal(false);
      setNewSubject({ name: '', code: '', level: 'General', classes: '' });
      fetchSubjects();
    } catch (error) {
      console.error("Error adding subject: ", error);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to remove this subject?")) {
      try {
        await deleteDoc(doc(db, "subjects", id));
        fetchSubjects();
      } catch (error) {
        console.error("Error deleting subject: ", error);
      }
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Subject Curriculum Report', 14, 15);
    const tableData = subjects.map(s => [s.name, s.code, s.level, s.classes]);
    doc.autoTable({
      head: [['Subject Name', 'Code', 'Department', 'Applicable Classes']],
      body: tableData,
      startY: 20,
    });
    doc.save('subject_curriculum.pdf');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Subject <span className="text-gradient">Curriculum</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Define and manage subjects across different academic departments.</p>
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
            <Plus size={20} /> Add New Subject
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading subjects...</div>
      ) : subjects.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No subjects found. Add a new subject.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {subjects.map((sub) => (
            <div key={sub.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', position: 'relative' }}>
              <button 
                onClick={() => handleDelete(sub.id)}
                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
              >
                <Trash2 size={16} />
              </button>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <BookOpen size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', paddingRight: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem' }}>{sub.name}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>{sub.code}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{sub.classes}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    padding: '0.2rem 0.6rem', 
                    background: 'var(--glass-bg)', 
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--glass-border)'
                  }}>
                    {sub.level}
                  </span>
                </div>
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
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setShowAddModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '1.5rem' }}>Add New Subject</h2>
            <form onSubmit={handleAddSubject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Subject Name</label>
                <input required type="text" placeholder="e.g. Mathematics" value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Subject Code</label>
                <input required type="text" placeholder="e.g. MTH101" value={newSubject.code} onChange={e => setNewSubject({...newSubject, code: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Department/Level</label>
                <select value={newSubject.level} onChange={e => setNewSubject({...newSubject, level: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }}>
                  <option value="General">General</option>
                  <option value="Science">Science</option>
                  <option value="Arts">Arts</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Basic">Basic</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Applicable Classes</label>
                <input required type="text" placeholder="e.g. JSS1 - SS3" value={newSubject.classes} onChange={e => setNewSubject({...newSubject, classes: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '1rem', justifyContent: 'center' }}>Save Subject</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;
