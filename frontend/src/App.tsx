import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import TaskBoard from './pages/dashboard/TaskBoard';
import TaskList from './pages/dashboard/TaskList';
import Profile from './pages/profile';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard/board" replace />} />
        <Route path="board" element={<TaskBoard />} />
        <Route path="list" element={<TaskList />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default App;
