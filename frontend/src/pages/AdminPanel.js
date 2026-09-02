import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function AdminPanel() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [waName, setWaName] = useState('');
  const [waLink, setWaLink] = useState('');
  const [waList, setWaList] = useState([]);
  const [legalData, setLegalData] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [contacts, setContacts] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [selectedGroupForMembers, setSelectedGroupForMembers] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [availableUsersForGroup, setAvailableUsersForGroup] = useState([]);
  const [userToAdd, setUserToAdd] = useState('');

  const token = localStorage.getItem('hpv_token');
  const headers = { Authorization: `Bearer ${token}` };

  const loadData = async () => {
    try {
      const [pendingRes, usersRes, groupsRes] = await Promise.all([
        axios.get('/api/admin/users/pending', { headers }),
        axios.get('/api/admin/users', { headers }),
        axios.get('/api/admin/groups', { headers })
      ]);
      setPendingUsers(pendingRes.data.users || []);
      setUsers(usersRes.data.users || []);
      setGroups(groupsRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadWhatsApp = async () => {
    try {
      const res = await axios.get('/api/admin/whatsapp', { headers });
      setWaList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadLegalData = async () => {
    try {
      const res = await axios.get('/api/legal');
      setLegalData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadContacts = async () => {
    try {
      const res = await axios.get('/api/contact', { headers });
      setContacts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    loadWhatsApp();
    loadLegalData();
    loadContacts();
  }, []);

  const approveUser = async (id) => {
    await axios.post(`/api/admin/users/${id}/approve`, {}, { headers });
    loadData();
  };

  const blockUser = async (id) => {
    await axios.post(`/api/admin/users/${id}/block`, {}, { headers });
    loadData();
  };

  const loadGroupMembers = async (groupId) => {
    try {
      const [membersRes, usersRes] = await Promise.all([
        axios.get(`/api/admin/groups/${groupId}/members`, { headers }),
        axios.get('/api/admin/users', { headers, params: { limit: 500 } })
      ]);
      const members = membersRes.data || [];
      const allUsers = usersRes.data.users || [];
      const memberIds = members.map(m => m.id);

      setGroupMembers(members);
      setAvailableUsersForGroup(allUsers.filter(u => !memberIds.includes(u.id)));
      setSelectedGroupForMembers(groupId);
    } catch (err) {
      console.error('Fehler beim Laden der Gruppenmitglieder:', err);
    }
  };

  const toggleGroupMembers = (groupId) => {
    if (selectedGroupForMembers === groupId) {
      setSelectedGroupForMembers(null);
      setGroupMembers([]);
      setAvailableUsersForGroup([]);
      setUserToAdd('');
    } else {
      loadGroupMembers(groupId);
    }
  };

  const addUserToGroup = async (userId, groupId) => {
    if (!userId) return;
    try {
      await axios.post(`/api/admin/groups/${groupId}/members`, { userId }, { headers });
      setUserToAdd('');
      await Promise.all([loadGroupMembers(groupId), loadData()]);
    } catch (err) {
      alert('Fehler beim Hinzufügen des Benutzers zur Gruppe.');
    }
  };

  const removeUserFromGroup = async (userId, groupId) => {
    if (!window.confirm('Benutzer wirklich aus der Gruppe entfernen?')) return;
    try {
      await axios.delete(`/api/admin/groups/${groupId}/members/${userId}`, { headers });
      await Promise.all([loadGroupMembers(groupId), loadData()]);
    } catch (err) {
      alert('Fehler beim Entfernen des Benutzers aus der Gruppe.');
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    await axios.post('/api/admin/groups', { name: groupName }, { headers });
    setGroupName('');
    loadData();
  };

  const createWhatsApp = async (e) => {
    e.preventDefault();
    await axios.post('/api/admin/whatsapp', { name: waName, invite_link: waLink }, { headers });
    setWaName('');
    setWaLink('');
    loadWhatsApp();
  };

  const sendGroupMail = async (e) => {
    e.preventDefault();
    if (!selectedGroup) {
      alert('Bitte Gruppe wählen.');
      return;
    }

    try {
      const res = await axios.post(`/api/admin/groups/${selectedGroup}/send-email`, { subject: mailSubject, content: mailBody }, { headers });
      alert(res.data.message);
      setMailSubject('');
      setMailBody('');
    } catch (err) {
      alert(err.response?.data?.message || 'Fehler beim Senden');
    }
  };

  const saveSmtpSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/admin/settings/smtp', { host: smtpHost, port: smtpPort, user: smtpUser, pass: smtpPass }, { headers });
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || 'Fehler beim Speichern');
    }
  };

  const handleStatusChange = async (id, status) => {
    await axios.put(`/api/contact/${id}/status`, { status }, { headers });
    loadContacts();
  };

  const handleUserUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/users/${editUser.id}`, editUser, { headers });
      setEditUser(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Fehler beim Speichern');
    }
  };

  const statusBadge = (status) => {
    const palette = {
      pending: 'warning',
      active: 'success',
      blocked: 'danger',
      answered: 'success',
      archived: 'secondary',
      new: 'danger',
      read: 'info'
    };
    return <span className={`badge bg-${palette[status] || 'secondary'} text-capitalize`}>{status}</span>;
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Admin Panel</h2>
        <div className="d-flex gap-2">
          <Link to="/admin/create-user" className="btn btn-success btn-sm">
            <i className="bi bi-plus-circle"></i> Neuer Benutzer
          </Link>
          <span className="badge bg-primary rounded-pill px-3 py-2">Verwaltung</span>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-warning shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-warning fw-bold">Ausstehende Freischaltungen</span>
                <span className="badge bg-warning text-dark">{pendingUsers.length}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-primary shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-primary fw-bold">Mitglieder gesamt</span>
                <span className="badge bg-primary">{users.length}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-success shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-success fw-bold">Kontaktanfragen</span>
                <span className="badge bg-success">{contacts.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4 shadow-sm border-warning">
        <div className="card-header bg-warning text-dark fw-bold">Ausstehende Freischaltungen</div>
        <div className="card-body">
          {pendingUsers.length === 0 ? <p className="mb-0 text-muted">Keine ausstehenden Anfragen.</p> : (
            <ul className="list-group list-group-flush">
              {pendingUsers.map(u => (
                <li key={u.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <div>
                    <strong>{u.name}</strong><br />
                    <small className="text-muted">{u.email}</small>
                  </div>
                  <button onClick={() => approveUser(u.id)} className="btn btn-sm btn-success">Freischalten</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card mb-4 shadow-sm border-primary">
        <div className="card-header bg-primary text-white fw-bold">Alle Benutzer</div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Rolle</th><th>Status</th><th className="text-end">Aktion</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{statusBadge(u.status)}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setEditUser(u)}>Bearbeiten</button>
                      {u.status === 'active' && <button onClick={() => blockUser(u.id)} className="btn btn-sm btn-danger">Sperren</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card mb-4 shadow-sm border-secondary">
        <div className="card-header bg-secondary text-white fw-bold">Gruppenverwaltung</div>
        <div className="card-body">
          <form className="mb-3 row g-2" onSubmit={createGroup}>
            <div className="col-md-10">
              <input className="form-control" placeholder="Neue Gruppe..." value={groupName} onChange={e => setGroupName(e.target.value)} required />
            </div>
            <div className="col-md-2 d-grid">
              <button className="btn btn-success">Erstellen</button>
            </div>
          </form>
          <ul className="list-group list-group-flush">
            {groups.map(g => (
              <li key={g.id} className="list-group-item px-0">
                <div className="d-flex justify-content-between align-items-center">
                  <span><strong>{g.name}</strong> <span className="text-muted">({g.member_count} Mitglieder)</span></span>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => toggleGroupMembers(g.id)}
                  >
                    {selectedGroupForMembers === g.id ? 'Schließen' : 'Mitglieder verwalten'}
                  </button>
                </div>

                {selectedGroupForMembers === g.id && (
                  <div className="mt-3 border rounded p-3 bg-light">
                    <div className="row g-2 align-items-end mb-3">
                      <div className="col-md-9">
                        <label className="form-label mb-1">Benutzer hinzufügen</label>
                        <select className="form-select" value={userToAdd} onChange={e => setUserToAdd(e.target.value)}>
                          <option value="">Benutzer auswählen...</option>
                          {availableUsersForGroup.map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-3 d-grid">
                        <button
                          className="btn btn-success"
                          disabled={!userToAdd}
                          onClick={() => addUserToGroup(Number(userToAdd), g.id)}
                        >
                          Hinzufügen
                        </button>
                      </div>
                    </div>

                    {groupMembers.length === 0 ? (
                      <p className="mb-0 text-muted">Noch keine Mitglieder in dieser Gruppe.</p>
                    ) : (
                      <ul className="list-group">
                        {groupMembers.map(m => (
                          <li key={m.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <span>
                              {m.name} <small className="text-muted">{m.email}</small> {statusBadge(m.status)}
                            </span>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => removeUserFromGroup(m.id, g.id)}>Entfernen</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card mb-4 shadow-sm border-success">
        <div className="card-header bg-success text-white fw-bold">📲 WhatsApp-Gruppen (Interne Links)</div>
        <div className="card-body">
          <form onSubmit={createWhatsApp} className="row g-2 mb-3">
            <div className="col-md-5">
              <input className="form-control" placeholder="Gruppen-Name (z.B. C-Trainer Hessen)" value={waName} onChange={e => setWaName(e.target.value)} required />
            </div>
            <div className="col-md-5">
              <input className="form-control" placeholder="https://chat.whatsapp.com/..." value={waLink} onChange={e => setWaLink(e.target.value)} required />
            </div>
            <div className="col-md-2">
              <button className="btn btn-success w-100" type="submit">Hinzufügen</button>
            </div>
          </form>
          <ul className="list-group list-group-flush">
            {waList.map(wa => (
              <li key={wa.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                <span><strong>{wa.name}:</strong> <a href={wa.invite_link} target="_blank" rel="noreferrer">{wa.invite_link}</a></span>
                <button className="btn btn-sm btn-outline-danger" onClick={async () => { await axios.delete(`/api/admin/whatsapp/${wa.id}`, { headers }); loadWhatsApp(); }}>Löschen</button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card mb-4 shadow-sm border-info">
        <div className="card-header bg-info text-white fw-bold">✉️ E-Mail an Gruppe senden (BCC)</div>
        <div className="card-body">
          <form onSubmit={sendGroupMail}>
            <div className="mb-2">
              <select className="form-select" value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} required>
                <option value="">Gruppe auswählen...</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div className="mb-2">
              <input className="form-control" placeholder="Betreff" value={mailSubject} onChange={e => setMailSubject(e.target.value)} required />
            </div>
            <div className="mb-2">
              <textarea className="form-control" rows="3" placeholder="Nachricht..." value={mailBody} onChange={e => setMailBody(e.target.value)} required />
            </div>
            <button className="btn btn-info text-white" type="submit">BCC-Mail Senden</button>
          </form>
        </div>
      </div>

      <div className="card mb-4 shadow-sm border-dark">
        <div className="card-header bg-dark text-white fw-bold">📄 Rechtstexte</div>
        <div className="card-body">
          {legalData.map(item => (
            <div key={item.key} className="mb-3 border rounded p-3 bg-light">
              <h6 className="fw-bold text-uppercase mb-2">{item.key}</h6>
              <p className="mb-1"><strong>Titel:</strong> {item.title}</p>
              <small className="text-muted">{item.content.slice(0, 120)}...</small>
            </div>
          ))}
        </div>
      </div>

      <div className="card mb-4 shadow-sm border-dark">
        <div className="card-header bg-dark text-white fw-bold">📥 Posteingang: Kontaktanfragen</div>
        <div className="card-body">
          {contacts.length === 0 ? <p className="mb-0 text-muted">Keine Kontaktanfragen vorhanden.</p> : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr><th>Absender</th><th>Betreff</th><th>Nachricht</th><th>Status</th><th>Aktion</th></tr>
                </thead>
                <tbody>
                  {contacts.map(c => (
                    <tr key={c.id} className={c.status === 'archived' ? 'table-secondary text-muted' : ''}>
                      <td><strong>{c.name}</strong><br /><small>{c.email}</small></td>
                      <td>{c.subject}</td>
                      <td><p className="mb-0" style={{ maxWidth: '300px' }}>{c.message}</p></td>
                      <td>{statusBadge(c.status)}</td>
                      <td>
                        <a href={`mailto:${c.email}?subject=Re: ${c.subject}`} onClick={() => handleStatusChange(c.id, 'answered')} className="btn btn-sm btn-outline-primary me-1">✉️ Antworten</a>
                        {c.status !== 'archived' ? (
                          <button onClick={() => handleStatusChange(c.id, 'archived')} className="btn btn-sm btn-outline-secondary me-1">📦 Archiv</button>
                        ) : (
                          <button onClick={() => handleStatusChange(c.id, 'new')} className="btn btn-sm btn-outline-warning me-1">↩️ Aktivieren</button>
                        )}
                        <button onClick={async () => { await axios.delete(`/api/contact/${c.id}`, { headers }); loadContacts(); }} className="btn btn-sm btn-outline-danger">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card shadow-sm border-light">
        <div className="card-header bg-light fw-bold">⚙️ SMTP-Konfiguration</div>
        <div className="card-body">
          <form onSubmit={saveSmtpSettings} className="row g-2">
            <div className="col-md-6">
              <input className="form-control" placeholder="SMTP Host" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} />
            </div>
            <div className="col-md-3">
              <input className="form-control" placeholder="Port" value={smtpPort} onChange={e => setSmtpPort(e.target.value)} />
            </div>
            <div className="col-md-6">
              <input className="form-control" placeholder="SMTP Benutzer" value={smtpUser} onChange={e => setSmtpUser(e.target.value)} />
            </div>
            <div className="col-md-6">
              <input type="password" className="form-control" placeholder="SMTP Passwort" value={smtpPass} onChange={e => setSmtpPass(e.target.value)} />
            </div>
            <div className="col-12">
              <button className="btn btn-primary" type="submit">SMTP speichern</button>
            </div>
          </form>
        </div>
      </div>

      {editUser && (
        <div className="modal d-block bg-dark bg-opacity-50" style={{ position: 'fixed', inset: 0 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">User Editieren: {editUser.name}</h5>
              </div>
              <form onSubmit={handleUserUpdate}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Name</label>
                      <input className="form-control" value={editUser.name} onChange={e => setEditUser({ ...editUser, name: e.target.value })} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">E-Mail</label>
                      <input className="form-control" value={editUser.email} onChange={e => setEditUser({ ...editUser, email: e.target.value })} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Rolle</label>
                      <select className="form-select" value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })}>
                        <option value="Admin">Admin</option>
                        <option value="Moderator">Moderator</option>
                        <option value="User">User</option>
                        <option value="Gast">Gast</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={editUser.status} onChange={e => setEditUser({ ...editUser, status: e.target.value })}>
                        <option value="pending">pending</option>
                        <option value="active">active</option>
                        <option value="blocked">blocked</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Trainer-Lizenz</label>
                      <select className="form-select" value={editUser.license_level || 'Keine'} onChange={e => setEditUser({ ...editUser, license_level: e.target.value })}>
                        <option value="Keine">Keine</option>
                        <option value="Hilfstrainer">Hilfstrainer</option>
                        <option value="C-Trainer">C-Trainer</option>
                        <option value="B-Trainer">B-Trainer</option>
                        <option value="A-Trainer">A-Trainer</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Lizenznummer</label>
                      <input className="form-control" value={editUser.license_number || ''} onChange={e => setEditUser({ ...editUser, license_number: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditUser(null)}>Abbrechen</button>
                  <button type="submit" className="btn btn-primary">Speichern</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
