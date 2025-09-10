import { Route, Routes, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import Settings from './pages/Settings';
import Arxiv from './pages/Arxiv';
import Support from './pages/Support';

export default function App() {
  return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<ProtectedRoute><Sidebar /></ProtectedRoute>}>
          <Route path="profile/:handle" element={<Profile />} />
          <Route index element={<ChatPage />}/>
          <Route path="settings" element={<Settings />}/>
          <Route path="arxiv" element={<Arxiv />}/>
          <Route path="support" element={<Support />}/>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
  );
};