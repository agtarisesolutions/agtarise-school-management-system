import React, { useState, useEffect } from 'react';
import { Save, User, Book, CheckCircle, AlertCircle } from 'lucide-react';
import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

const GradeBook = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch initial classes and subjects
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const classSnap = await getDocs(collection(db, "classes"));
        const classData = classSnap.docs.map(d => d.data().name);
        setClasses(classData);
        if (classData.length > 0) setSelectedClass(classData[0]);

        const subjSnap = await getDocs(collection(db, "subjects"));
        const subjData = subjSnap.docs.map(d => d.data().name);
        setSubjects(subjData);
        if (subjData.length > 0) setSelectedSubject(subjData[0]);
      } catch (err) {
        console.error("Error fetching metadata:", err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch students and existing grades when class or subject changes
  useEffect(() => {
    const fetchStudentsAndGrades = async () => {
      if (!selectedClass || !selectedSubject) return;
      setLoading(true);
      setSaveSuccess(false);
      try {
        // Fetch Students in the selected class
        const stuQuery = query(collection(db, "students"), where("class", "==", selectedClass));
        const stuSnap = await getDocs(stuQuery);
        const stuList = stuSnap.docs.map(d => ({ dbId: d.id, ...d.data() }));
        setStudents(stuList);

        // Fetch Existing Grades for these students in this subject
        const gradesQuery = query(
          collection(db, "grades"), 
          where("className", "==", selectedClass),
          where("subjectName", "==", selectedSubject)
        );
        const gradesSnap = await getDocs(gradesQuery);
        
        const existingGrades = {};
        gradesSnap.docs.forEach(d => {
          const data = d.data();
          existingGrades[data.studentId] = { test: data.testScore, exam: data.examScore };
        });

        // Initialize state with existing grades or 0
        const initialGradesState = {};
        stuList.forEach(s => {
          initialGradesState[s.studentId] = {
            test: existingGrades[s.studentId]?.test || 0,
            exam: existingGrades[s.studentId]?.exam || 0
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
        [field]: Number(value)
      }
    }));
    setSaveSuccess(false);
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    try {
      // Loop through all students and save their document in the 'grades' collection
      const savePromises = students.map(stu => {
        const stGrade = grades[stu.studentId];
        const total = stGrade.test + stGrade.exam;
        const letterGrade = total >= 75 ? 'A1' : total >= 70 ? 'B2' : total >= 65 ? 'B3' : total >= 60 ? 'C4' : total >= 55 ? 'C5' : total >= 50 ? 'C6' : 'F9';
        
        // Use a composite ID so we can overwrite the exact grade document easily
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Digital <span className="text-gradient">Gradebook</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Enter student marks for Continuous Assessment and Examinations.</p>
        </div>
        <button className="btn-primary" onClick={handleSaveMarks} disabled={saving || students.length === 0}>
          {saving ? 'Saving...' : <><Save size={18} /> Save All Marks</>}
        </button>
      </div>

      {saveSuccess && (
        <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={20} /> Grades saved successfully to the database!
        </div>
      )}

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Select Class</label>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{ padding: '0.75rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }}
          >
            {classes.length === 0 && <option>Loading...</option>}
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Select Subject</label>
          <select 
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{ padding: '0.75rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' }}
          >
            {subjects.length === 0 && <option>Loading...</option>}
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading students...</div>
        ) : students.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No students found in {selectedClass}. Go to Student Registry to add students to this class.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem' }}>Student ID</th>
                <th style={{ padding: '1rem' }}>Student Name</th>
                <th style={{ padding: '1rem' }}>C.A (40)</th>
                <th style={{ padding: '1rem' }}>Exam (60)</th>
                <th style={{ padding: '1rem' }}>Total (100)</th>
                <th style={{ padding: '1rem' }}>Grade</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((stu) => {
                const testScore = grades[stu.studentId]?.test || 0;
                const examScore = grades[stu.studentId]?.exam || 0;
                const total = testScore + examScore;
                const grade = total >= 75 ? 'A1' : total >= 70 ? 'B2' : total >= 65 ? 'B3' : total >= 60 ? 'C4' : total >= 55 ? 'C5' : total >= 50 ? 'C6' : 'F9';
                
                return (
                  <tr key={stu.studentId} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1rem', color: 'var(--primary-color)', fontWeight: '600' }}>{stu.studentId}</td>
                    <td style={{ padding: '1rem' }}>{stu.name}</td>
                    <td style={{ padding: '1rem' }}>
                      <input 
                        type="number" 
                        min="0" max="40"
                        value={testScore} 
                        onChange={(e) => handleGradeChange(stu.studentId, 'test', e.target.value)}
                        style={{ width: '60px', padding: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'white' }} 
                      />
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <input 
                        type="number" 
                        min="0" max="60"
                        value={examScore} 
                        onChange={(e) => handleGradeChange(stu.studentId, 'exam', e.target.value)}
                        style={{ width: '60px', padding: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'white' }} 
                      />
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '700' }}>{total}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ color: total >= 50 ? 'var(--success)' : 'var(--error)' }}>{grade}</span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {total > 0 ? <CheckCircle size={18} color="var(--success)" /> : <AlertCircle size={18} color="var(--warning)" />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GradeBook;
