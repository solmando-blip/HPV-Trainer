import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ToastContext } from '../context/ToastContext';

function AdminHospitality() {
  const { addToast } = useContext(ToastContext);
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  const token = localStorage.getItem('hpv_token');
  const headers = { Authorization: `Bearer ${token}` };

  const loadData = () => {
    const params = statusFilter ? { status: statusFilter } : {};
    axios.get('/api/admin/hospitality', { headers, params }).then(res => setRequests(res.data)).catch(err => console.error(err));
  };

  useEffect(() => { loadData(); }, [statusFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Hospitier-Anfrage wirklich löschen?')) return;
    try {
      await axios.delete(`/api/admin/hospitality/${id}`, { headers });
      addToast('Anfrage gelöscht.', 'success');
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Fehler.', 'error');
    }
  };

  const statusBadge = (status) => {
    const palette = { pending: 'warning', accepted: 'info', rejected: 'danger', confirmed: 'success' };
    return <span className={`badge bg-${palette[status] || 'secondary'}`}>{status}</span>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Hospitierungen verwalten</h2>
        <select className="form-select w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Alle Status</option>
          <option value="pending">pending</option>
          <option value="accepted">accepted</option>
          <option value="rejected">rejected</option>
          <option value="confirmed">confirmed</option>
        </select>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr><th>Requester</th><th>Host</th><th>Status</th><th>Date Proposed</th><th>Date Confirmed</th><th className="text-end">Aktion</th></tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id}>
                  <td>{r.requester_name}</td>
                  <td>{r.host_name}</td>
                  <td>{statusBadge(r.status)}</td>
                  <td>{r.date_proposed ? new Date(r.date_proposed).toLocaleDateString('de-DE') : '–'}</td>
                  <td>{r.date_confirmed ? new Date(r.date_confirmed).toLocaleDateString('de-DE') : '–'}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(r.id)}>Löschen</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminHospitality;
