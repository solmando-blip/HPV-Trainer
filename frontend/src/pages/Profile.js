import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Profile.css';

function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem('hpv_token');
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [token, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProfile(response.data);
      setName(response.data.name);
      setEmail(response.data.email);
      setLoading(false);
    } catch (error) {
      console.error('Profil-Fehler:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaveMessage('');
    setSaveError('');

    if (!name.trim() || !email.trim()) {
      setSaveError('Name und E-Mail sind erforderlich.');
      return;
    }

    try {
      const response = await axios.put('/api/auth/profile', 
        { name, email },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setSaveMessage(response.data.message);
      setProfile(response.data.user);
      
      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('hpv_user'));
      storedUser.name = response.data.user.name;
      storedUser.email = response.data.user.email;
      localStorage.setItem('hpv_user', JSON.stringify(storedUser));
    } catch (error) {
      setSaveError(error.response?.data?.message || 'Fehler beim Speichern.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Alle Felder sind erforderlich.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Neues Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Neue Passwörter stimmen nicht überein.');
      return;
    }

    try {
      const response = await axios.post('/api/auth/change-password',
        { currentPassword, newPassword },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setPasswordMessage(response.data.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Fehler beim Ändern des Passworts.');
    }
  };

  if (loading) {
    return <div className="alert alert-info">Laden...</div>;
  }

  if (!profile) {
    return <div className="alert alert-danger">Profil konnte nicht geladen werden.</div>;
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <h1>Mein Profil</h1>
          <hr />

          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                Profilinformationen
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                Passwort ändern
              </button>
            </li>
          </ul>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-body">
                {saveMessage && <div className="alert alert-success">{saveMessage}</div>}
                {saveError && <div className="alert alert-danger">{saveError}</div>}

                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">E-Mail</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Rolle</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profile.role}
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profile.status === 'active' ? 'Aktiv' : profile.status === 'pending' ? 'Ausstehend' : 'Blockiert'}
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Registriert am</label>
                  <input
                    type="text"
                    className="form-control"
                    value={new Date(profile.created_at).toLocaleDateString('de-DE')}
                    disabled
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  onClick={handleUpdateProfile}
                >
                  Speichern
                </button>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="card">
              <div className="card-body">
                {passwordMessage && <div className="alert alert-success">{passwordMessage}</div>}
                {passwordError && <div className="alert alert-danger">{passwordError}</div>}

                <form onSubmit={handleChangePassword}>
                  <div className="mb-3">
                    <label className="form-label">Aktuelles Passwort</label>
                    <input
                      type="password"
                      className="form-control"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Geben Sie Ihr aktuelles Passwort ein"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Neues Passwort</label>
                    <input
                      type="password"
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mindestens 6 Zeichen"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Neues Passwort bestätigen</label>
                    <input
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Passwort wiederholen"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Passwort ändern
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
