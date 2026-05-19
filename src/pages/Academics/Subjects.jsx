import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Filter, Download, X, Trash2, Layers, CheckCircle, Edit2, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
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

  const handleEditSubject = async (e) => {
    e.preventDefault();
    try {
      const subjectRef = doc(db, "subjects", editingSubject.id);
      await updateDoc(subjectRef, {
        name: editingSubject.name,
        code: editingSubject.code,
        level: editingSubject.level,
        classes: editingSubject.classes,
        description: editingSubject.description || ''
      });
      setEditingSubject(null);
      fetchSubjects();
    } catch (error) {
      console.error("Error updating subject: ", error);
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

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    const tableRows = filteredSubjects.map(s => `
      <tr>
        <td>${s.name}</td>
        <td>${s.code}</td>
        <td>${s.level} Department</td>
        <td>${s.classes}</td>
      </tr>
    `).join('');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Subject Curriculum Report</title>
          <style>
            body {
              font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              padding: 40px;
              color: #1e293b;
              background-color: #ffffff;
            }
            .report-container {
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #6366f1;
              padding-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 26px;
              color: #4f46e5;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .header p {
              margin: 5px 0 0;
              color: #64748b;
              font-size: 14px;
            }
            .meta {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              font-size: 14px;
              color: #475569;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 35px;
            }
            th, td {
              padding: 12px;
              border: 1px solid #cbd5e1;
              text-align: left;
              font-size: 14px;
            }
            th {
              background-color: #f1f5f9;
              font-weight: 600;
              color: #1e293b;
            }
            .footer {
              text-align: center;
              margin-top: 50px;
              font-size: 12px;
              color: #94a3b8;
              border-top: 1px dashed #cbd5e1;
              padding-top: 20px;
            }
            @media print {
              body {
                padding: 0;
              }
              .report-container {
                max-width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            <div class="header">
              <h1>Agtarise Solutions School</h1>
              <p>Official Subject Curriculum Report</p>
            </div>
            <div class="meta">
              <div><strong>Department Filter:</strong> ${filterLevel}</div>
              <div><strong>Date Generated:</strong> ${new Date().toLocaleDateString()}</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Subject Name</th>
                  <th>Code</th>
                  <th>Department</th>
                  <th>Applicable Classes</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows || '<tr><td colspan="4" style="text-align: center;">No subjects found</td></tr>'}
              </tbody>
            </table>
            <div class="footer">
              <p>This is an official document generated by Agtarise School Management System.</p>
              <p style="margin-top: 5px;">© 2026 Agtarise Solutions. All rights reserved.</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Subject <span className="text-gradient">Curriculum</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Define academic standards and manage subject allocation.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setShowPreviewModal(true)} className="btn-secondary" style={{ background: 'var(--glass-bg)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} /> Export / Preview Report
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
                  <button onClick={() => setEditingSubject(sub)} style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center' }} className="icon-btn-hover">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(sub.id)} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center' }} className="icon-btn-hover">
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
            <button onClick={() => setShowAddModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
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

      {editingSubject && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={() => setEditingSubject(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '0.5rem', fontSize: '1.75rem' }}>Edit <span className="text-gradient">Subject</span></h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Update course information in the school curriculum.</p>
            
            <form onSubmit={handleEditSubject} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Subject Name</label>
                  <input required type="text" placeholder="e.g. Physics" value={editingSubject.name} onChange={e => setEditingSubject({...editingSubject, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Code</label>
                  <input required type="text" placeholder="PHY101" value={editingSubject.code} onChange={e => setEditingSubject({...editingSubject, code: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Department/Category</label>
                <select value={editingSubject.level} onChange={e => setEditingSubject({...editingSubject, level: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }}>
                  {levels.filter(l => l !== 'All').map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Applicable Classes</label>
                <input required type="text" placeholder="e.g. SS1, SS2, SS3" value={editingSubject.classes} onChange={e => setEditingSubject({...editingSubject, classes: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Description (Optional)</label>
                <textarea placeholder="Briefly describe the course content..." value={editingSubject.description} onChange={e => setEditingSubject({...editingSubject, description: e.target.value})} style={{ width: '100%', height: '80px', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', resize: 'none' }} />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', padding: '1rem', justifyContent: 'center', fontSize: '1rem' }}>
                Update Subject
              </button>
            </form>
          </div>
        </div>
      )}

      {showPreviewModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '800px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={() => setShowPreviewModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Report Preview: <span className="text-gradient">Subject Curriculum</span></h2>
            
            <div style={{
              background: 'white',
              color: '#334155',
              padding: '2.5rem',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              marginBottom: '1.5rem',
              fontFamily: 'system-ui, sans-serif'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid #6366f1', paddingBottom: '1rem' }}>
                <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#4f46e5', fontWeight: 'bold' }}>Agtarise Solutions School</h1>
                <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>Official Subject Curriculum Report</p>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                <div><strong>Department Filter:</strong> {filterLevel}</div>
                <div><strong>Date Generated:</strong> {new Date().toLocaleDateString()}</div>
              </div>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', border: '1px solid #cbd5e1' }}>Subject Name</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', border: '1px solid #cbd5e1' }}>Code</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', border: '1px solid #cbd5e1' }}>Department</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', border: '1px solid #cbd5e1' }}>Applicable Classes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubjects.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', border: '1px solid #cbd5e1' }}>No subjects matched the criteria.</td>
                    </tr>
                  ) : filteredSubjects.map(sub => (
                    <tr key={sub.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.75rem', fontWeight: '500', border: '1px solid #cbd5e1' }}>{sub.name}</td>
                      <td style={{ padding: '0.75rem', border: '1px solid #cbd5e1' }}>{sub.code}</td>
                      <td style={{ padding: '0.75rem', border: '1px solid #cbd5e1' }}>{sub.level} Department</td>
                      <td style={{ padding: '0.75rem', border: '1px solid #cbd5e1' }}>{sub.classes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div style={{ textAlign: 'center', marginTop: '3rem', borderTop: '1px dashed #cbd5e1', paddingTop: '1rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                This is a system generated report preview.
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={generatePDF} 
                className="btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Download size={16} /> Download PDF
              </button>
              <button 
                onClick={handlePrintReport} 
                className="btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#10b981' }}
              >
                <Printer size={16} /> Print Report
              </button>
              <button 
                onClick={() => setShowPreviewModal(false)} 
                style={{ 
                  padding: '0.75rem 1.25rem', 
                  background: 'var(--glass-bg)', 
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;
