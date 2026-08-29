import React, { useState } from 'react';
import axios from 'axios';

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/contact', form);
      setMsg('Nachricht erfolgreich gesendet.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setMsg('Fehler beim Senden.');
    }
  };

  return (
    <div className="max-w-md mx-auto card card-body shadow-sm">
      <h2>Kontakt</h2>
      {msg && <div className="alert alert-info">{msg}</div>}
      <form onSubmit={handleSubmit}>
        <input className="form-control mb-2" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input className="form-control mb-2" type="email" placeholder="E-Mail" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input className="form-control mb-2" placeholder="Betreff" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
        <textarea className="form-control mb-2" placeholder="Nachricht" rows="4" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
        <button className="btn btn-primary w-100" type="submit">Absenden</button>
      </form>
    </div>
  );
}

export default Contact;
