import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Filter, Download, X, Trash2, Layers, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('All');
  const [newSubject, setNewSubject] = useState({
    name: '', code: '', level: 'General', classes: '', description: ''
  });

  const levels = ['All', 'General', 'Science', 'Arts', 'Commercial', 'Basic', 'Nursery'];

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "subjects"), orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
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
      await addDoc(collection(db, "subjects"), {
        ...newSubject,
        createdAt: new Date().toISOString()
      });
      setShowAddModal(false);
      setNewSubject({ name: '', code: '', level: 'General', classes: '', description: '' });
      fetchSubjects();
    } catch (error) {
      console.error("Error adding subject: ", error);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to remove this subject? This will not affect existing grades but will remove the subject from the curriculum.")) {
      try {
        await deleteDoc(doc(db, "subjects", id));
        fetchSubjects();
      } catch (error) {
        console.error("Error deleting subject: ", error);
      }
    }
  };

  const filteredSubjects = subjects.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         sub.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'All' || sub.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Agtarise School - Official Curriculum', 14, 15);
    const tableData = filteredSubjects.map(s => [s.name, s.code, s.level, s.classes]);
    doc.autoTable({
      head: [['Subject Name', 'Code', 'Department', 'Applicable Classes']],
      body: tableData,
      startY: 25,
      theme: 'grid',
      headStyles: { fillStyle: '#6366f1' }
    });
    doc.save('subject_curriculum.pdf');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Subject <span className="text-gradient">Curriculum</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Define academic standards and manage subject allocation.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={generatePDF} className="btn-secondary" style={{ background: 'var(--glass-bg)', color: 'white' }}>
            <Download size={18} /> Export PDF
          </button>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={20} /> Add New Subject
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
          <input 
            type="text" 
            placeholder="Search by name or code..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.2rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {levels.map(lvl => (
            <button 
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              style={{
                padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--glass-border)',
                background: filterLevel === lvl ? 'var(--primary-color)' : 'var(--glass-bg)',
                color: 'white', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap'
              }}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="loader"></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Synchronizing curriculum...</p>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', borderStyle: 'dashed' }}>
          <BookOpen size={48} color="var(--text-muted)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
          <h3 style={{ color: 'var(--text-muted)' }}>No subjects matched your criteria.</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Try adjusting your filters or add a new subject to the system.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredSubjects.map((sub) => (
            <div key={sub.id} className="glass-card card-hover" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: '56px', height: '56px', 
                  background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                  borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                  boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.4)'
                }}>
                  <BookOpen size={28} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{sub.name}</h3>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{sub.code}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{sub.classes}</p>
                </div>
              </div>
              
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ 
                  fontSize: '0.75rem', padding: '0.25rem 0.75rem', 
                  background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-full)', border: '1px solid var(--glass-border)', color: 'var(--text-muted)'
                }}>
                  {sub.level} Department
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleDelete(sub.id)} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px' }} className="icon-btn-hover">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', opacity: 0.05 }}>
                <BookOpen size={100} />
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={() => setShowAddModal(false)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '0.5rem', fontSize: '1.75rem' }}>Add New <span className="text-gradient">Subject</span></h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Define a new course to be added to the school curriculum.</p>
            
            <form onSubmit={handleAddSubject} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Subject Name</label>
                  <input required type="text" placeholder="e.g. Physics" value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Code</label>
                  <input required type="text" placeholder="PHY101" value={newSubject.code} onChange={e => setNewSubject({...newSubject, code: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Department/Category</label>
                <select value={newSubject.level} onChange={e => setNewSubject({...newSubject, level: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }}>
                  {levels.filter(l => l !== 'All').map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Applicable Classes</label>
                <input required type="text" placeholder="e.g. SS1, SS2, SS3" value={newSubject.classes} onChange={e => setNewSubject({...newSubject, classes: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Description (Optional)</label>
                <textarea placeholder="Briefly describe the course content..." value={newSubject.description} onChange={e => setNewSubject({...newSubject, description: e.target.value})} style={{ width: '100%', height: '80px', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', resize: 'none' }} />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', padding: '1rem', justifyContent: 'center', fontSize: '1rem' }}>
                <CheckCircle size={20} /> Register Subject
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;
