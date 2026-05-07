import React, { useState, useEffect } from 'react';
import { Save, User, Book, CheckCircle, AlertCircle, Upload, X, FileText, Link } from 'lucide-react';
import { collection, getDocs, doc, setDoc, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const GradeBook = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingStudent, setUploadingStudent] = useState(null);
  const [resultUrl, setResultUrl] = useState('');
  const [bulkText, setBulkText] = useState('');

  // Fetch initial classes and subjects
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Fetch official classes
        const classSnap = await getDocs(collection(db, "classes"));
        let classData = classSnap.docs.map(d => d.data().name);
        
        // Also fetch unique classes from existing students to prevent mismatches
        const stuSnap = await getDocs(collection(db, "students"));
        const stuClasses = [...new Set(stuSnap.docs.map(d => d.data().class))].filter(Boolean);
        
        // Merge and deduplicate
        classData = [...new Set([...classData, ...stuClasses])].sort();
        
        setClasses(classData);
        
        if (user?.role === 'teacher' && user?.assignedClass) {
          setSelectedClass(user.assignedClass);
        } else if (classData.length > 0) {
          setSelectedClass(classData[0]);
        }

        // Fetch subjects
        const subjSnap = await getDocs(collection(db, "subjects"));
        const subjData = subjSnap.docs.map(d => d.data().name).sort();
        setSubjects(subjData);
        if (subjData.length > 0) setSelectedSubject(subjData[0]);
      } catch (err) {
        console.error("Error fetching metadata:", err);
      }
    };
    fetchMetadata();
  }, [user]);

  // Fetch students and existing grades when class or subject changes
  useEffect(() => {
    const fetchStudentsAndGrades = async () => {
      if (!selectedClass) {
        setStudents([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setSaveSuccess(false);
      try {
        const stuQuery = query(collection(db, "students"), where("class", "==", selectedClass));
        const stuSnap = await getDocs(stuQuery);
        const stuList = stuSnap.docs.map(d => ({ dbId: d.id, ...d.data() }));
        setStudents(stuList);

        if (!selectedSubject) {
          setLoading(false);
          return; // Don't fetch grades if no subject is selected
        }

        const gradesQuery = query(
          collection(db, "grades"), 
          where("className", "==", selectedClass),
          where("subjectName", "==", selectedSubject)
        );
        const gradesSnap = await getDocs(gradesQuery);
        
        const existingGrades = {};
        gradesSnap.docs.forEach(d => {
          const data = d.data();
          existingGrades[data.studentId] = { test: data.testScore, exam: data.examScore, resultUrl: data.resultUrl };
        });

        const initialGradesState = {};
        stuList.forEach(s => {
          initialGradesState[s.studentId] = {
            test: existingGrades[s.studentId]?.test || 0,
            exam: existingGrades[s.studentId]?.exam || 0,
            resultUrl: existingGrades[s.studentId]?.resultUrl || ''
          };
        });
        setGrades(initialGradesState);

      } catch (err) {
        console.error("Error fetching students/grades:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndGrades();
  }, [selectedClass, selectedSubject]);

  const handleGradeChange = (studentId, field, value) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: field === 'resultUrl' ? value : Number(value)
      }
    }));
    setSaveSuccess(false);
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    try {
      const savePromises = students.map(stu => {
        const stGrade = grades[stu.studentId];
        const total = stGrade.test + stGrade.exam;
        const letterGrade = total >= 75 ? 'A1' : total >= 70 ? 'B2' : total >= 65 ? 'B3' : total >= 60 ? 'C4' : total >= 55 ? 'C5' : total >= 50 ? 'C6' : 'F9';
        
        const docId = `${stu.studentId}_${selectedSubject.replace(/\s+/g, '_')}`;
        
        return setDoc(doc(db, "grades", docId), {
          studentId: stu.studentId,
          studentName: stu.name,
          className: selectedClass,
          subjectName: selectedSubject,
          testScore: stGrade.test,
          examScore: stGrade.exam,
          totalScore: total,
          grade: letterGrade,
          resultUrl: stGrade.resultUrl || '',
          updatedAt: new Date().toISOString()
        });
      });

      await Promise.all(savePromises);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving grades:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpload = () => {
    const lines = bulkText.split('\n');
    const newGrades = { ...grades };
    lines.forEach(line => {
      const [id, test, exam] = line.split(',').map(s => s.trim());
      if (id && newGrades[id]) {
        newGrades[id] = { ...newGrades[id], test: Number(test) || 0, exam: Number(exam) || 0 };
      }
    });
    setGrades(newGrades);
    setShowBulkModal(false);
    setBulkText('');
  };

  const openUploadModal = (student) => {
    setUploadingStudent(student);
    setResultUrl(grades[student.studentId]?.resultUrl || '');
    setShowUploadModal(true);
  };

  const handleSaveUpload = () => {
    handleGradeChange(uploadingStudent.studentId, 'resultUrl', resultUrl);
    setShowUploadModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Digital <span className="text-gradient">Gradebook</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>{user?.role === 'teacher' ? `Managing: ${user.assignedClass}` : 'Enter student marks for Continuous Assessment and Examinations.'}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" onClick={() => setShowBulkModal(true)}>
            <Upload size={18} /> Bulk Upload
          </button>
          <button className="btn-primary" onClick={handleSaveMarks} disabled={saving || students.length === 0}>
            {saving ? 'Saving...' : <><Save size={18} /> Save All Marks</>}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={20} /> Grades saved successfully!
        </div>
      )}

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Select Class</label>
          <select 
            value={selectedClass}
            disabled={user?.role === 'teacher' || classes.length === 0}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{ padding: '0.75rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }}
          >
            {classes.length === 0 && <option value="">No classes available</option>}
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Select Subject</label>
          <select 
            value={selectedSubject}
            disabled={subjects.length === 0}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{ padding: '0.75rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }}
          >
            {subjects.length === 0 && <option value="">Please add subjects first</option>}
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading students...</div>
        ) : !selectedClass ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Please select a class to view students.</div>
        ) : !selectedSubject ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--warning)' }}>No subjects found. Please go to Academics > Subjects to create subjects.</div>
        ) : students.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>No students found in {selectedClass}.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem' }}>Student ID</th>
                <th style={{ padding: '1rem' }}>Student Name</th>
                <th style={{ padding: '1rem' }}>C.A (40)</th>
                <th style={{ padding: '1rem' }}>Exam (60)</th>
                <th style={{ padding: '1rem' }}>Total</th>
                <th style={{ padding: '1rem' }}>Grade</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Document</th>
              </tr>
            </thead>
            <tbody>
              {students.map((stu) => {
                const stLog = grades[stu.studentId] || { test: 0, exam: 0, resultUrl: '' };
                const total = stLog.test + stLog.exam;
                const grade = total >= 75 ? 'A1' : total >= 70 ? 'B2' : total >= 65 ? 'B3' : total >= 60 ? 'C4' : total >= 55 ? 'C5' : total >= 50 ? 'C6' : 'F9';
                
                return (
                  <tr key={stu.studentId} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1rem', color: 'var(--primary-color)', fontWeight: '600' }}>{stu.studentId}</td>
                    <td style={{ padding: '1rem' }}>{stu.name}</td>
                    <td style={{ padding: '1rem' }}>
                      <input 
                        type="number" min="0" max="40"
                        value={stLog.test} 
                        onChange={(e) => handleGradeChange(stu.studentId, 'test', e.target.value)}
                        style={{ width: '60px', padding: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'white' }} 
                      />
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <input 
                        type="number" min="0" max="60"
                        value={stLog.exam} 
                        onChange={(e) => handleGradeChange(stu.studentId, 'exam', e.target.value)}
                        style={{ width: '60px', padding: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'white' }} 
                      />
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '700' }}>{total}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ color: total >= 50 ? 'var(--success)' : 'var(--error)' }}>{grade}</span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button 
                        onClick={() => openUploadModal(stu)}
                        style={{ background: 'transparent', border: 'none', color: stLog.resultUrl ? 'var(--success)' : 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        {stLog.resultUrl ? <CheckCircle size={18} /> : <FileText size={18} />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showBulkModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setShowBulkModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
            <h2 style={{ marginBottom: '1rem' }}>Bulk Result Upload</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Format: <b>StudentID, Test, Exam</b> (one student per line)</p>
            <textarea 
              value={bulkText} onChange={(e) => setBulkText(e.target.value)}
              placeholder="STU1234, 30, 55&#10;STU5678, 25, 48"
              style={{ width: '100%', height: '200px', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', fontFamily: 'monospace' }}
            />
            <button className="btn-primary" style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }} onClick={handleBulkUpload}>
              Apply scores to Gradebook
            </button>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setShowUploadModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
            <h2 style={{ marginBottom: '1rem' }}>Upload Result Sheet</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Attach a scanned copy or link for <b>{uploadingStudent?.name}</b></p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem' }}>Result URL / Drive Link</label>
              <div style={{ position: 'relative' }}>
                <Link style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                <input 
                  type="text" value={resultUrl} onChange={(e) => setResultUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }}
                />
              </div>
            </div>
            
            <button className="btn-primary" style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }} onClick={handleSaveUpload}>
              Attach Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeBook;
