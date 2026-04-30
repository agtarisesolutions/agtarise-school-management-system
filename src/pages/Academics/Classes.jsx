import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreVertical, Edit2, Trash2, Download, TrendingUp, X } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

const Classes = () => {
  const [filter, setFilter] = useState('All');
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClass, setNewClass] = useState({
    name: '', level: 'Secondary', teacher: ''
  });

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "classes"));
      const classData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClasses(classData);
    } catch (error) {
      console.error("Error fetching classes: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleAddClass = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "classes"), {
        ...newClass,
        students: 0 // New classes start with 0 students
      });
      setShowAddModal(false);
      setNewClass({ name: '', level: 'Secondary', teacher: '' });
      fetchClasses();
    } catch (error) {
      console.error("Error adding class: ", error);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to remove this class?")) {
      try {
        await deleteDoc(doc(db, "classes", id));
        fetchClasses();
      } catch (error) {
        console.error("Error deleting class: ", error);
      }
    }
  };

  const filteredClasses = filter === 'All' ? classes : classes.filter(c => c.level === filter);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('School Classes Report', 14, 15);
    const tableData = filteredClasses.map(c => [c.name, c.level, c.students, c.teacher]);
    doc.autoTable({
      head: [['Class Name', 'Level', 'Students', 'Class Teacher']],
      body: tableData,
      startY: 20,
    });
    doc.save('classes_report.pdf');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Class <span className="text-gradient">Management</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage and organize classes across all school levels.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => window.location.href='/academics/promote'} className="btn-primary" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'white' }}>
            <TrendingUp size={18} /> Promote Students
          </button>
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
            <Plus size={20} /> Add New Class
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['All', 'Nursery', 'Primary', 'Secondary'].map(lvl => (
              <button 
                key={lvl}
                onClick={() => setFilter(lvl)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--glass-border)',
                  background: filter === lvl ? 'var(--primary-color)' : 'var(--glass-bg)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'var(--transition-fast)'
                }}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '250px' }}>
            <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
            <input 
              type="text" 
              placeholder="Search classes..."
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                color: 'white',
                outline: 'none',
                fontSize: '0.85rem'
              }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading classes...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem' }}>Class Name</th>
                <th style={{ padding: '1rem' }}>Level</th>
                <th style={{ padding: '1rem' }}>Total Students</th>
                <th style={{ padding: '1rem' }}>Class Teacher</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No classes found. Add a new class.</td>
                </tr>
              ) : filteredClasses.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem', fontWeight: '600' }}>{item.name}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.75rem',
                      background: 'rgba(99, 102, 241, 0.1)',
                      color: 'var(--primary-color)',
                      border: '1px solid rgba(99, 102, 241, 0.2)'
                    }}>
                      {item.level}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>{item.students}</td>
                  <td style={{ padding: '1rem' }}>{item.teacher}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button onClick={() => handleDelete(item.id)} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
            <h2 style={{ marginBottom: '1.5rem' }}>Add New Class</h2>
            <form onSubmit={handleAddClass} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Class Name</label>
                <input required type="text" placeholder="e.g. SS3 A" value={newClass.name} onChange={e => setNewClass({...newClass, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Level</label>
                <select value={newClass.level} onChange={e => setNewClass({...newClass, level: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }}>
                  <option value="Nursery">Nursery</option>
                  <option value="Primary">Primary</option>
                  <option value="Secondary">Secondary</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Class Teacher</label>
                <input required type="text" placeholder="e.g. Mr. Okoro" value={newClass.teacher} onChange={e => setNewClass({...newClass, teacher: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '1rem', justifyContent: 'center' }}>Save Class</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;
