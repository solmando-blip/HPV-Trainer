import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { validateEmail } from '../utils/validation';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'E-Mail ist erforderlich.';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse.';
    }
    
    if (!password) {
      newErrors.password = 'Passwort ist erforderlich.';
    } else if (password.length < 6) {
      newErrors.password = 'Passwort ist zu kurz.';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setErrors({});
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    localStorage.removeItem('hpv_token');
    localStorage.removeItem('hpv_user');
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      onLogin(res.data.user, res.data.token);
      navigate('/');
    } catch (e) {
      setErr(e.response?.data?.message || 'Login fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col-md-6 mx-auto card card-body shadow-sm">
      <h2>Anmelden</h2>
      {err && <div className="alert alert-danger">{err}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">E-Mail</label>
          <input 
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            type="email" 
            placeholder="E-Mail eingeben" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
          />
          {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Passwort</label>
          <input 
            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
            type="password" 
            placeholder="Passwort eingeben" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
          />
          {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
        </div>

        <button 
          className="btn btn-primary w-100 mb-2" 
          type="submit"
          disabled={loading}
        >
          {loading ? 'Anmelden...' : 'Anmelden'}
        </button>
      </form>
      
      <small className="d-block text-center mb-3">
        <Link to="/forgot-password">Passwort vergessen?</Link>
      </small>

      <hr className="my-2" />

      <small className="d-block text-center">
        Noch nicht registriert? <Link to="/register">Jetzt registrieren</Link>
      </small>
    </div>
  );
}

export default Login;
