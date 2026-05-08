import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ExamStart from './pages/ExamStart.jsx';
import ExamTest from './pages/ExamTest.jsx';
import ExamResult from './pages/ExamResult.jsx';
import History from './pages/History.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminQuestions from './pages/admin/AdminQuestions.jsx';
import AdminImport from './pages/admin/AdminImport.jsx';

function Protected({ children, admin = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          element={
            <Protected>
              <Layout />
            </Protected>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/exam/start" element={<ExamStart />} />
          <Route path="/exam/test" element={<ExamTest />} />
          <Route path="/exam/result/:id" element={<ExamResult />} />
          <Route path="/history" element={<History />} />
        </Route>
        <Route
          path="/admin"
          element={
            <Protected admin>
              <Layout />
            </Protected>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="questions" element={<AdminQuestions />} />
          <Route path="import" element={<AdminImport />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
