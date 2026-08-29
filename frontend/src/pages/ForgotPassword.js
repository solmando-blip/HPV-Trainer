import React, { useState } from 'react';
import axios from 'axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setMsg(res.data.message);
    } catch (err) {
      setMsg('Fehler beim Anfordern.');
    }
  };

  return (
    <div className="col-md-6 mx-auto card card-body shadow-sm">
      <h2>Passwort Reset</h2>
      {msg && <div className="alert alert-info">{msg}</div>}
      <form onSubmit={handleSubmit}>
        <input className="form-control mb-3" type="email" placeholder="E-Mail" value={email} onChange={e => setEmail(e.target.value)} required />
        <button className="btn btn-primary w-100" type="submit">Reset Link Senden</button>
      </form>
    </div>
  );
}

export default ForgotPassword;
