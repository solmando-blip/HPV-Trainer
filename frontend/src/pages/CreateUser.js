import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '../context/ToastContext';
import '../styles/CreateUser.css';

function CreateUser() {
  const navigate = useNavigate();
  const { addToast } = useContext(ToastContext);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'User',
    status: 'active',
    license_level: 'Keine',
    license_number: '',
    license_expires_at: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = 'Name ist erforderlich';
    if (form.name.trim().length < 2) newErrors.name = 'Name muss mindestens 2 Zeichen lang sein';

    if (!form.email.trim()) newErrors.email = 'E-Mail ist erforderlich';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Gültige E-Mail-Adresse erforderlich';

    if (!form.password) newErrors.password = 'Passwort ist erforderlich';
    if (form.password.length < 6) newErrors.password = 'Passwort muss mindestens 6 Zeichen lang sein';

    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwörter stimmen nicht überein';

    if (form.license_level !== 'Keine' && !form.license_number) {
      newErrors.license_number = 'Lizenznummer ist erforderlich bei Lizenzauswahl';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast('Bitte füllen Sie alle erforderlichen Felder aus', 'error');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        status: form.status,
        license_level: form.license_level,
        license_number: form.license_number || null,
        license_expires_at: form.license_expires_at || null
      };

      const response = await axios.post('/api/admin/users', payload);
      addToast('Benutzer erfolgreich erstellt', 'success');
      
      // Kurze Verzögerung, dann zurück zur Benutzerliste
      setTimeout(() => {
        navigate('/admin/users');
      }, 1500);
    } catch (error) {
      addToast(error.response?.data?.message || 'Fehler beim Erstellen des Benutzers', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="create-user-card card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0">Neuer Benutzer</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Persönliche Daten */}
            <fieldset className="mb-4 border p-3 rounded">
              <legend className="text-lg font-weight-bold">Persönliche Daten</legend>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="name" className="form-label">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Volständiger Name"
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="email" className="form-label">E-Mail *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="benutzer@example.com"
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
              </div>
            </fieldset>

            {/* Anmeldedaten */}
            <fieldset className="mb-4 border p-3 rounded">
              <legend className="text-lg font-weight-bold">Anmeldedaten</legend>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="password" className="form-label">Passwort *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    value={form.password}
                    onChange={handleInputChange}
                    placeholder="Mindestens 6 Zeichen"
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Passwort wiederholen *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    value={form.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Passwort wiederholen"
                  />
                  {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                </div>
              </div>
            </fieldset>

            {/* Rollen & Status */}
            <fieldset className="mb-4 border p-3 rounded">
              <legend className="text-lg font-weight-bold">Rollen & Status</legend>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="role" className="form-label">Rolle</label>
                  <select
                    id="role"
                    name="role"
                    className="form-select"
                    value={form.role}
                    onChange={handleInputChange}
                  >
                    <option value="User">Benutzer</option>
                    <option value="Moderator">Moderator</option>
                    <option value="Admin">Administrator</option>
                    <option value="Gast">Gast</option>
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="status" className="form-label">Status</label>
                  <select
                    id="status"
                    name="status"
                    className="form-select"
                    value={form.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Aktiv</option>
                    <option value="pending">Ausstehend</option>
                    <option value="blocked">Gesperrt</option>
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Trainerlizenz */}
            <fieldset className="mb-4 border p-3 rounded">
              <legend className="text-lg font-weight-bold">Trainerlizenz</legend>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="license_level" className="form-label">Lizenzstufe</label>
                  <select
                    id="license_level"
                    name="license_level"
                    className="form-select"
                    value={form.license_level}
                    onChange={handleInputChange}
                  >
                    <option value="Keine">Keine</option>
                    <option value="Hilfstrainer">Hilfstrainer</option>
                    <option value="C-Trainer">C-Trainer</option>
                    <option value="B-Trainer">B-Trainer</option>
                    <option value="A-Trainer">A-Trainer</option>
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="license_number" className="form-label">
                    Lizenznummer
                    {form.license_level !== 'Keine' && <span className="text-danger">*</span>}
                  </label>
                  <input
                    type="text"
                    id="license_number"
                    name="license_number"
                    className={`form-control ${errors.license_number ? 'is-invalid' : ''}`}
                    value={form.license_number}
                    onChange={handleInputChange}
                    placeholder="z.B. LIC-2024-001"
                    disabled={form.license_level === 'Keine'}
                  />
                  {errors.license_number && <div className="invalid-feedback">{errors.license_number}</div>}
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="license_expires_at" className="form-label">Lizenzablaufdatum</label>
                  <input
                    type="date"
                    id="license_expires_at"
                    name="license_expires_at"
                    className="form-control"
                    value={form.license_expires_at}
                    onChange={handleInputChange}
                    disabled={form.license_level === 'Keine'}
                  />
                </div>
              </div>
            </fieldset>

            {/* Buttons */}
            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? 'Erstelle...' : 'Benutzer Erstellen'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/admin/users')}
                disabled={loading}
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateUser;
