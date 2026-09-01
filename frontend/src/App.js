import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import ToastContainer from './components/ToastContainer';
import ToastProvider from './context/ToastContext';
import useAuthTimeout from './hooks/useAuthTimeout';
import Home from './pages/Home';
import News from './pages/News';
import Documents from './pages/Documents';
import Contact from './pages/Contact';
import Legal from './pages/Legal';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import CreateUser from './pages/CreateUser';

function AppContent({ user, handleLogout, handleLogin }) {
  useAuthTimeout(30 * 60 * 1000); // 30-minute timeout

  return (
    <>
      <Header user={user} onLogout={handleLogout} />
      <ToastContainer />
      <div className="container py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<News user={user} />} />
          <Route path="/documents" element={<Documents user={user} />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin"
            element={user && ['Admin', 'Moderator'].includes(user.role) ? <AdminPanel /> : <Navigate to="/" />}
          />
          <Route
            path="/admin/create-user"
            element={user && user.role === 'Admin' ? <CreateUser /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
    </>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('hpv_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (err) {
      localStorage.removeItem('hpv_user');
      localStorage.removeItem('hpv_token');
      return null;
    }
  });

  const handleLogin = (userData, token) => {
    localStorage.setItem('hpv_token', token);
    localStorage.setItem('hpv_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('hpv_token');
    localStorage.removeItem('hpv_user');
    setUser(null);
  };

  return (
    <ToastProvider>
      <Router>
        <AppContent user={user} handleLogout={handleLogout} handleLogin={handleLogin} />
      </Router>
    </ToastProvider>
  );
}

export default App;
