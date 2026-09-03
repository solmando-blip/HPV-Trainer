import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ToastContext } from '../context/ToastContext';

function Hospitality() {
  const { addToast } = useContext(ToastContext);
  const [requests, setRequests] = useState([]);
  const [confirmingId, setConfirmingId] = useState(null);
  const [confirmDate, setConfirmDate] = useState('');
  const [confirmLocation, setConfirmLocation] = useState('');
  const [confirmNotes, setConfirmNotes] = useState('');

  const token = localStorage.getItem('hpv_token');
  const headers = { Authorization: `Bearer ${token}` };

  const loadData = async () => {
    try {
      const [mineRes, receivedRes] = await Promise.all([
        axios.get('/api/hospitality/mine', { headers }),
        axios.get('/api/hospitality/received', { headers })
      ]);
      const combined = [
        ...mineRes.data.map(r => ({ ...r, direction: 'sent' })),
        ...receivedRes.data.map(r => ({ ...r, direction: 'received' }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setRequests(combined);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadData(); }, []);

  const cancelRequest = async (id) => {
    if (!window.confirm('Anfrage wirklich stornieren?')) return;
    try {
      await axios.delete(`/api/hospitality/${id}`, { headers });
      addToast('Anfrage storniert.', 'success');
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Fehler beim Stornieren.', 'error');
    }
  };

  const accept = async (id) => {
    try {
      await axios.put(`/api/hospitality/${id}/accept`, {}, { headers });
      addToast('Anfrage angenommen.', 'success');
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Fehler.', 'error');
    }
  };

  const reject = async (id) => {
    try {
      await axios.put(`/api/hospitality/${id}/reject`, {}, { headers });
      addToast('Anfrage abgelehnt.', 'success');
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Fehler.', 'error');
    }
  };

  const startConfirm = (id) => {
    setConfirmingId(id);
    setConfirmDate('');
    setConfirmLocation('');
    setConfirmNotes('');
  };

  const submitConfirm = async (id) => {
    try {
      await axios.put(`/api/hospitality/${id}/confirm`, {
        date_confirmed: confirmDate, location: confirmLocation, notes: confirmNotes
      }, { headers });
      addToast('Termin bestätigt.', 'success');
      setConfirmingId(null);
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
      <h2 className="mb-4">🤝 Hospitieren</h2>

      {requests.length === 0 ? <p className="text-muted">Noch keine Hospitier-Anfragen.</p> : (
        <div className="list-group">
          {requests.map(r => (
            <div key={`${r.direction}-${r.id}`} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div>
                  <span className="badge bg-secondary me-2">{r.direction === 'sent' ? 'Gesendet' : 'Erhalten'}</span>
                  <strong>{r.direction === 'sent' ? r.host_name : r.requester_name}</strong>
                  <span className="ms-2">{statusBadge(r.status)}</span>
                  {r.message && <p className="mb-0 small text-muted mt-1">{r.message}</p>}
                  {r.date_confirmed && (
                    <p className="mb-0 small text-muted">
                      Termin: {new Date(r.date_confirmed).toLocaleDateString('de-DE')} {r.location ? `· ${r.location}` : ''}
                    </p>
                  )}
                </div>
                <div className="d-flex gap-2">
                  {r.direction === 'sent' && r.status === 'pending' && (
                    <button className="btn btn-sm btn-outline-danger" onClick={() => cancelRequest(r.id)}>Anfrage stornieren</button>
                  )}
                  {r.direction === 'received' && r.status === 'pending' && (
                    <>
                      <button className="btn btn-sm btn-success" onClick={() => accept(r.id)}>Akzeptieren</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => reject(r.id)}>Ablehnen</button>
                    </>
                  )}
                  {r.direction === 'received' && r.status === 'accepted' && confirmingId !== r.id && (
                    <button className="btn btn-sm btn-primary" onClick={() => startConfirm(r.id)}>Termin bestätigen</button>
                  )}
                </div>
              </div>

              {confirmingId === r.id && (
                <div className="row g-2 mt-2 border-top pt-2">
                  <div className="col-md-3">
                    <input type="date" className="form-control form-control-sm" value={confirmDate} onChange={e => setConfirmDate(e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <input className="form-control form-control-sm" placeholder="Ort" value={confirmLocation} onChange={e => setConfirmLocation(e.target.value)} />
                  </div>
                  <div className="col-md-4">
                    <input className="form-control form-control-sm" placeholder="Hinweise" value={confirmNotes} onChange={e => setConfirmNotes(e.target.value)} />
                  </div>
                  <div className="col-md-2 d-flex gap-2">
                    <button className="btn btn-sm btn-primary" onClick={() => submitConfirm(r.id)} disabled={!confirmDate}>Bestätigen</button>
                    <button className="btn btn-sm btn-secondary" onClick={() => setConfirmingId(null)}>Abbrechen</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Hospitality;
