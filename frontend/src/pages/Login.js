import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    localStorage.removeItem('hpv_token');
    localStorage.removeItem('hpv_user');
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      onLogin(res.data.user, res.data.token);
      navigate('/');
    } catch (e) {
      setErr(e.response?.data?.message || 'Login fehlgeschlagen');
    }
  };

  return (
    <div className="col-md-6 mx-auto card card-body shadow-sm">
      <h2>Anmelden</h2>
      {err && <div className="alert alert-danger">{err}</div>}
      <form onSubmit={handleSubmit}>
        <input className="form-control mb-3" type="email" placeholder="E-Mail" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="form-control mb-3" type="password" placeholder="Passwort" value={password} onChange={e => setPassword(e.target.value)} required />
        <button className="btn btn-primary w-100 mb-2" type="submit">Login</button>
      </form>
      <Link to="/forgot-password">Passwort vergessen?</Link>
    </div>
  );
}

export default Login;
