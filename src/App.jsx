import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MainLayout from './components/MainLayout';

// Academics
import Classes from './pages/Academics/Classes';
import Subjects from './pages/Academics/Subjects';

// Finance
import Fees from './pages/Finance/Fees';
import Payroll from './pages/Finance/Payroll';

// Students & Staff
import StudentList from './pages/Students/StudentList';
import StaffList from './pages/Staff/StaffList';

// Attendance, Reports, Inventory & Settings
import Attendance from './pages/Attendance/Attendance';
import Reports from './pages/Reports/Reports';
import Inventory from './pages/Inventory/Inventory';
import Settings from './pages/Settings/Settings';

// Teacher, Results, Timetable & Promotion
import GradeBook from './pages/TeacherPortal/GradeBook';
import ResultChecker from './pages/Results/ResultChecker';
import PromoteStudents from './pages/Academics/PromoteStudents';
import Timetable from './pages/Timetable/Timetable';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } 
          />

          {/* Academics & Results Module */}
          <Route path="/academics" element={<ProtectedRoute><MainLayout><Classes /></MainLayout></ProtectedRoute>} />
          <Route path="/academics/classes" element={<ProtectedRoute><MainLayout><Classes /></MainLayout></ProtectedRoute>} />
          <Route path="/academics/subjects" element={<ProtectedRoute><MainLayout><Subjects /></MainLayout></ProtectedRoute>} />
          <Route path="/academics/promote" element={<ProtectedRoute><MainLayout><PromoteStudents /></MainLayout></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><MainLayout><ResultChecker /></MainLayout></ProtectedRoute>} />
          <Route path="/timetable" element={<ProtectedRoute><MainLayout><Timetable /></MainLayout></ProtectedRoute>} />
          <Route path="/gradebook" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><MainLayout><GradeBook /></MainLayout></ProtectedRoute>} />

          {/* Finance & Payroll Modules */}
          <Route path="/finance" element={<ProtectedRoute><MainLayout><Fees /></MainLayout></ProtectedRoute>} />
          <Route path="/payroll" element={<ProtectedRoute><MainLayout><Payroll /></MainLayout></ProtectedRoute>} />

          {/* Students & Staff Modules */}
          <Route path="/students" element={<ProtectedRoute><MainLayout><StudentList /></MainLayout></ProtectedRoute>} />
          <Route path="/staff" element={<ProtectedRoute><MainLayout><StaffList /></MainLayout></ProtectedRoute>} />

          {/* Attendance, Reports, Inventory & Settings Modules */}
          <Route path="/attendance" element={<ProtectedRoute><MainLayout><Attendance /></MainLayout></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><MainLayout><Reports /></MainLayout></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><MainLayout><Inventory /></MainLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<div>404 - Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
