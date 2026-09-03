import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ToastContext } from '../context/ToastContext';

const EXPERIENCE_LEVELS = ['Anfänger', 'Fortgeschritten', 'Erfahren', 'Experte'];

function TrainerProfileForm() {
  const { addToast } = useContext(ToastContext);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    verein: '',
    region: '',
    has_license: false,
    experience_level: 'Anfänger',
    description: '',
    is_visible: true,
    accepts_hospitality: true
  });

  const token = localStorage.getItem('hpv_token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get('/api/trainer-profiles/me', { headers }).then(res => {
      if (res.data) {
        setForm({
          verein: res.data.verein || '',
          region: res.data.region || '',
          has_license: res.data.has_license,
          experience_level: res.data.experience_level,
          description: res.data.description || '',
          is_visible: res.data.is_visible,
          accepts_hospitality: res.data.accepts_hospitality
        });
      }
    }).catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('/api/trainer-profiles/me', form, { headers });
      addToast('Trainer-Profil gespeichert.', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Fehler beim Speichern.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h2 className="mb-0 h5">Mein Trainer-Profil</h2>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Verein</label>
              <input className="form-control" name="verein" value={form.verein} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Region</label>
              <input className="form-control" name="region" value={form.region} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <div className="form-check mt-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="has_license"
                  name="has_license"
                  checked={form.has_license}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="has_license">Trainer-Lizenz vorhanden</label>
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label">Erfahrungslevel</label>
              <select className="form-select" name="experience_level" value={form.experience_level} onChange={handleChange}>
                {EXPERIENCE_LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Beschreibung</label>
              <textarea className="form-control" rows="4" name="description" value={form.description} onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="is_visible"
                  name="is_visible"
                  checked={form.is_visible}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="is_visible">Im Verzeichnis sichtbar?</label>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="accepts_hospitality"
                  name="accepts_hospitality"
                  checked={form.accepts_hospitality}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="accepts_hospitality">Hospitierungen akzeptieren?</label>
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-success mt-4" disabled={loading}>
            {loading ? 'Speichere...' : 'Speichern'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TrainerProfileForm;
