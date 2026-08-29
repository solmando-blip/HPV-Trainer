import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/register', form);
      setMsg(res.data.message);
      setErr('');
    } catch (e) {
      setErr(e.response?.data?.message || 'Registrierung fehlgeschlagen.');
    }
  };

  return (
    <div className="col-md-6 mx-auto card card-body shadow-sm">
      <h2>Registrieren</h2>
      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-danger">{err}</div>}
      <form onSubmit={handleSubmit}>
        <input className="form-control mb-3" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input className="form-control mb-3" type="email" placeholder="E-Mail" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input className="form-control mb-3" type="password" placeholder="Passwort" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        <button className="btn btn-primary w-100" type="submit">Konto Erstellen</button>
      </form>
    </div>
  );
}

export default Register;
