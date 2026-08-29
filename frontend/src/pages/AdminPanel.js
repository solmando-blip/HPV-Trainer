import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPanel() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState('');

  const token = localStorage.getItem('hpv_token');
  const headers = { Authorization: `Bearer ${token}` };

  const loadData = async () => {
    try {
      const [pendingRes, usersRes, groupsRes] = await Promise.all([
        axios.get('/api/admin/users/pending', { headers }),
        axios.get('/api/admin/users', { headers }),
        axios.get('/api/admin/groups', { headers })
      ]);
      setPendingUsers(pendingRes.data);
      setUsers(usersRes.data);
      setGroups(groupsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadData(); }, []);

  const approveUser = async (id) => {
    await axios.post(`/api/admin/users/${id}/approve`, {}, { headers });
    loadData();
  };

  const blockUser = async (id) => {
    await axios.post(`/api/admin/users/${id}/block`, {}, { headers });
    loadData();
  };

  const createGroup = async (e) => {
    e.preventDefault();
    await axios.post('/api/admin/groups', { name: groupName }, { headers });
    setGroupName('');
    loadData();
  };

  return (
    <div>
      <h2>Admin Panel</h2>

      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-warning text-dark fw-bold">Ausstehende Freischaltungen</div>
        <div className="card-body">
          {pendingUsers.length === 0 ? <p>Keine ausstehenden Anfragen.</p> : (
            <ul className="list-group">
              {pendingUsers.map(u => (
                <li key={u.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>{u.name} ({u.email})</span>
                  <button onClick={() => approveUser(u.id)} className="btn btn-sm btn-success">Freischalten</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white fw-bold">Alle Benutzer</div>
        <div className="card-body">
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Rolle</th><th>Status</th><th>Aktion</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{u.status}</td>
                  <td>
                    {u.status === 'active' && <button onClick={() => blockUser(u.id)} className="btn btn-sm btn-danger">Sperren</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-secondary text-white fw-bold">Gruppenverwaltung</div>
        <div className="card-body">
          <form className="mb-3 d-flex" onSubmit={createGroup}>
            <input className="form-control me-2" placeholder="Neue Gruppe..." value={groupName} onChange={e => setGroupName(e.target.value)} required />
            <button className="btn btn-success">Erstellen</button>
          </form>
          <ul className="list-group">
            {groups.map(g => (
              <li key={g.id} className="list-group-item">{g.name} ({g.member_count} Mitglieder)</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
