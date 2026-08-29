import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import News from './pages/News';
import Documents from './pages/Documents';
import Contact from './pages/Contact';
import Legal from './pages/Legal';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminPanel from './pages/AdminPanel';

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
    <Router>
      <Header user={user} onLogout={handleLogout} />
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
          <Route
            path="/admin"
            element={user && ['Admin', 'Moderator'].includes(user.role) ? <AdminPanel /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
