import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const EXPERIENCE_LEVELS = ['Anfänger', 'Fortgeschritten', 'Erfahren', 'Experte'];

function TrainerDirectory() {
  const [profiles, setProfiles] = useState([]);
  const [vereine, setVereine] = useState([]);
  const [filters, setFilters] = useState({ verein: '', region: '', license: '', experience: '', q: '' });

  useEffect(() => {
    axios.get('/api/trainer-profiles/vereine').then(res => setVereine(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      axios.get('/api/trainer-profiles', { params })
        .then(res => setProfiles(res.data))
        .catch(err => console.error(err));
    }, 400);
    return () => clearTimeout(timeout);
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h2 className="mb-4">🏅 Trainer-Verzeichnis</h2>
      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="card shadow-sm">
            <div className="card-header fw-bold">Filter</div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Verein</label>
                <select className="form-select" name="verein" value={filters.verein} onChange={handleFilterChange}>
                  <option value="">Alle</option>
                  {vereine.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Region</label>
                <input className="form-control" name="region" value={filters.region} onChange={handleFilterChange} />
              </div>
              <div className="mb-3 form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="licenseFilter"
                  checked={filters.license === 'true'}
                  onChange={e => setFilters({ ...filters, license: e.target.checked ? 'true' : '' })}
                />
                <label className="form-check-label" htmlFor="licenseFilter">Nur mit Lizenz</label>
              </div>
              <div className="mb-3">
                <label className="form-label">Erfahrung</label>
                <select className="form-select" name="experience" value={filters.experience} onChange={handleFilterChange}>
                  <option value="">Alle</option>
                  {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="mb-0">
                <label className="form-label">Suche</label>
                <input className="form-control" name="q" value={filters.q} onChange={handleFilterChange} placeholder="Name, Verein, ..." />
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-9">
          {profiles.length === 0 ? (
            <p className="text-muted">Keine Trainer-Profile gefunden.</p>
          ) : (
            <div className="row g-3">
              {profiles.map(p => (
                <div className="col-md-6" key={p.id}>
                  <div className="card shadow-sm h-100">
                    <div className="card-body">
                      <h5 className="card-title">{p.user_name}</h5>
                      <p className="card-text text-muted small mb-1">{p.verein} {p.region ? `· ${p.region}` : ''}</p>
                      <p className="card-text small mb-2">
                        {p.has_license ? 'Lizenzierter Trainer' : 'Keine Lizenz'} · {p.experience_level}
                      </p>
                      <Link to={`/trainer/${p.id}`} className="btn btn-sm btn-outline-primary">Profil ansehen</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrainerDirectory;
