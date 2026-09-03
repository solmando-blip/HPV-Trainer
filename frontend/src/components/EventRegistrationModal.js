import React, { useState, useContext } from 'react';
import axios from 'axios';
import { ToastContext } from '../context/ToastContext';

const EXPERIENCE_LEVELS = ['Anfänger', 'Fortgeschritten', 'Erfahren', 'Experte'];

function EventRegistrationModal({ event, user, onClose, onSuccess }) {
  const { addToast } = useContext(ToastContext);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user ? user.name : '',
    email: user ? user.email : '',
    verein: '',
    has_license: false,
    experience_level: 'Anfänger',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('hpv_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`/api/events/${event.id}/register`, form, { headers });
      addToast('Anmeldung erfolgreich.', 'success');
      onSuccess();
    } catch (err) {
      addToast(err.response?.data?.message || 'Fehler bei der Anmeldung.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal d-block bg-dark bg-opacity-50" style={{ position: 'fixed', inset: 0 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Anmeldung: {event.title}</h5>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Name *</label>
                <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">E-Mail *</label>
                <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Verein</label>
                <input className="form-control" name="verein" value={form.verein} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label d-block">Trainer-Lizenz</label>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name="has_license" id="license_ja" checked={form.has_license === true} onChange={() => setForm({ ...form, has_license: true })} />
                  <label className="form-check-label" htmlFor="license_ja">Ja</label>
                </div>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name="has_license" id="license_nein" checked={form.has_license === false} onChange={() => setForm({ ...form, has_license: false })} />
                  <label className="form-check-label" htmlFor="license_nein">Nein</label>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Erfahrungslevel</label>
                <select className="form-select" name="experience_level" value={form.experience_level} onChange={handleChange}>
                  {EXPERIENCE_LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Beschreibung (optional)</label>
                <textarea className="form-control" name="description" rows="3" value={form.description} onChange={handleChange} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Abbrechen</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Sende...' : 'Anmelden'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EventRegistrationModal;
