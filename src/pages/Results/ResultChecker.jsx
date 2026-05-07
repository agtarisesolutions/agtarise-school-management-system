import React, { useState } from 'react';
import { Search, FileText, Download, Award, ChevronRight, AlertCircle } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ResultChecker = () => {
  const { user } = useAuth();
  const [stuId, setStuId] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [studentDetails, setStudentDetails] = useState(null);
  const [resultData, setResultData] = useState([]);

  useEffect(() => {
    if ((user?.role === 'parent' || user?.role === 'student') && user?.linkedStudentId) {
      setStuId(user.linkedStudentId);
      performSearch(user.linkedStudentId);
    }
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(stuId);
  };

  const performSearch = async (searchId) => {
    if (!searchId) return;
    setLoading(true);
    setError('');
    
    try {
      // 1. Fetch Student Details
      const studentQuery = query(collection(db, "students"), where("studentId", "==", searchId));
      const studentSnap = await getDocs(studentQuery);
      
      if (studentSnap.empty) {
        setError('Student ID not found. Please check your Admission Number.');
        setLoading(false);
        return;
      }
      
      const studentInfo = studentSnap.docs[0].data();
      setStudentDetails({
        name: studentInfo.name,
        class: studentInfo.class,
        term: 'Current Term 2025/2026'
      });

      // 2. Fetch Grades for this student
      const gradesQuery = query(collection(db, "grades"), where("studentId", "==", searchId));
      const gradesSnap = await getDocs(gradesQuery);
      
      if (gradesSnap.empty) {
        setError('Results have not been released for this student yet.');
        setLoading(false);
        return;
      }

      const fetchedGrades = gradesSnap.docs.map(doc => {
        const data = doc.data();
        let remark = 'Pass';
        if (data.grade === 'A1') remark = 'Excellent';
        else if (data.grade === 'B2' || data.grade === 'B3') remark = 'Very Good';
        else if (data.grade === 'C4' || data.grade === 'C5' || data.grade === 'C6') remark = 'Good';
        else remark = 'Needs Improvement';

        return {
          name: data.subjectName,
          ca: data.testScore,
          exam: data.examScore,
          total: data.totalScore,
          grade: data.grade,
          remark: remark,
          resultUrl: data.resultUrl || ''
        };
      });

      const mainResultUrl = fetchedGrades.find(g => g.resultUrl)?.resultUrl || '';
      setResultData(fetchedGrades);
      setStudentDetails(prev => ({ ...prev, resultUrl: mainResultUrl }));
      setShowResult(true);

    } catch (err) {
      console.error("Error fetching results: ", err);
      setError('A system error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const downloadResult = () => {
    const doc = new jsPDF();
    doc.text('Agtarise Academy - Academic Report Sheet', 14, 15);
    doc.text(`Student: ${studentDetails.name} | Class: ${studentDetails.class}`, 14, 25);
    doc.text(`Term: ${studentDetails.term}`, 14, 32);
    
    const tableData = resultData.map(s => [s.name, s.ca, s.exam, s.total, s.grade, s.remark]);
    doc.autoTable({
      head: [['Subject', 'C.A (40)', 'Exam (60)', 'Total (100)', 'Grade', 'Remark']],
      body: tableData,
      startY: 40,
    });
    
    doc.save(`${studentDetails.name}_result.pdf`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Academic <span className="text-gradient">Results</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>Securely access and download terminal report sheets.</p>
      </div>

      {!showResult ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Award size={60} color="var(--primary-color)" style={{ marginBottom: '1.5rem' }} />
          
          {error && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', borderRadius: 'var(--radius-md)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {user?.role === 'parent' || user?.role === 'student' ? (
            <div style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Loading Your Records...</h3>
              {loading && <p style={{ color: 'var(--text-muted)' }}>Fetching authorized results from the portal.</p>}
            </div>
          ) : (
            <>
              <h3 style={{ marginBottom: '1.5rem' }}>Enter Student ID to View Result</h3>
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <input 
                  type="text" 
                  placeholder="e.g. STU1234"
                  value={stuId}
                  onChange={(e) => setStuId(e.target.value)}
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    padding: '0.8rem 1.5rem',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'white',
                    outline: 'none',
                    fontSize: '1rem'
                  }}
                  required
                />
                <button type="submit" className="btn-primary" style={{ padding: '0 2rem' }} disabled={loading}>
                  {loading ? 'Searching...' : <>Check Result <ChevronRight size={18} /></>}
                </button>
              </form>
              <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Note: Use your unique Admission Number (e.g., STU5678). Contact the school admin if you've lost it.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{studentDetails?.name}</h2>
              <p style={{ color: 'var(--text-muted)' }}>{studentDetails?.class} | {studentDetails?.term}</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {studentDetails?.resultUrl && (
                <a href={studentDetails.resultUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ textDecoration: 'none' }}>
                  <FileText size={18} /> View Document
                </a>
              )}
              <button onClick={downloadResult} className="btn-primary">
                <Download size={18} /> Download Report Sheet
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>
                  <th style={{ padding: '1rem' }}>Subject</th>
                  <th style={{ padding: '1rem' }}>C.A</th>
                  <th style={{ padding: '1rem' }}>Exam</th>
                  <th style={{ padding: '1rem' }}>Total</th>
                  <th style={{ padding: '1rem' }}>Grade</th>
                  <th style={{ padding: '1rem' }}>Remark</th>
                </tr>
              </thead>
              <tbody>
                {resultData.map((sub, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: '600' }}>{sub.name}</td>
                    <td style={{ padding: '1rem' }}>{sub.ca}</td>
                    <td style={{ padding: '1rem' }}>{sub.exam}</td>
                    <td style={{ padding: '1rem', fontWeight: '700' }}>{sub.total}</td>
                    <td style={{ padding: '1rem', color: 'var(--primary-color)', fontWeight: '700' }}>{sub.grade}</td>
                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{sub.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--primary-color)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Principal's Remark</h4>
            <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
              "Result represents academic performance for the current session. Please ensure fees are fully paid to avoid disruption in the next term."
            </p>
          </div>
          
          <button onClick={() => { setShowResult(false); setStuId(''); setResultData([]); setStudentDetails(null); }} style={{ marginTop: '2rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ← Back to Search
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultChecker;
