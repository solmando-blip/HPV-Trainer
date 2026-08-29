import React, { useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

function ResetPassword() {
  const [params] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/reset-password', { token: params.get('token'), newPassword });
      setMsg('Passwort erfolgreich geändert. Leite zum Login weiter...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMsg('Fehler beim Zurücksetzen.');
    }
  };

  return (
    <div className="col-md-6 mx-auto card card-body shadow-sm">
      <h2>Neues Passwort festlegen</h2>
      {msg && <div className="alert alert-info">{msg}</div>}
      <form onSubmit={handleSubmit}>
        <input className="form-control mb-3" type="password" placeholder="Neues Passwort" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
        <button className="btn btn-primary w-100" type="submit">Speichern</button>
      </form>
    </div>
  );
}

export default ResetPassword;
