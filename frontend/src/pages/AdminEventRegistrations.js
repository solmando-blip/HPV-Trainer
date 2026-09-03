import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { ToastContext } from '../context/ToastContext';

function AdminEventRegistrations() {
  const { eventId } = useParams();
  const { addToast } = useContext(ToastContext);
  const [events, setEvents] = useState([]);
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);

  const token = localStorage.getItem('hpv_token');
  const headers = { Authorization: `Bearer ${token}` };

  const loadPicker = () => {
    axios.get('/api/admin/event-registrations', { headers }).then(res => setEvents(res.data)).catch(err => console.error(err));
  };

  const loadRegistrations = () => {
    axios.get(`/api/admin/event-registrations/${eventId}`, { headers })
      .then(res => { setEvent(res.data.event); setRegistrations(res.data.registrations); })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (eventId) loadRegistrations();
    else loadPicker();
  }, [eventId]);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/admin/event-registrations/${id}/status`, { status }, { headers });
      addToast('Status aktualisiert.', 'success');
      loadRegistrations();
    } catch (err) {
      addToast(err.response?.data?.message || 'Fehler.', 'error');
    }
  };

  const exportCsv = async () => {
    try {
      const res = await axios.get(`/api/admin/event-registrations/${eventId}/export`, { headers, responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `event-${eventId}-registrations.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      addToast('Fehler beim CSV-Export.', 'error');
    }
  };

  const statusBadge = (status) => {
    const palette = { pending: 'warning', accepted: 'success', rejected: 'danger' };
    return <span className={`badge bg-${palette[status] || 'secondary'}`}>{status}</span>;
  };

  if (!eventId) {
    return (
      <div>
        <h2 className="mb-4">Event-Anmeldungen</h2>
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead><tr><th>Event</th><th>Datum</th><th>Teilnehmer</th><th className="text-end">Aktion</th></tr></thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev.id}>
                    <td>{ev.title}</td>
                    <td>{new Date(ev.date).toLocaleDateString('de-DE')}</td>
                    <td>{ev.registered_count}/{ev.max_participants}</td>
                    <td className="text-end">
                      <Link to={`/admin/event-registrations/${ev.id}`} className="btn btn-sm btn-outline-primary">Anmeldungen ansehen</Link>
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Anmeldungen: {event?.title}</h2>
        <div className="d-flex gap-2">
          <Link to="/admin/event-registrations" className="btn btn-outline-secondary btn-sm">Zurück</Link>
          <button className="btn btn-outline-primary btn-sm" onClick={exportCsv}>CSV Export</button>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Verein</th><th>Lizenz</th><th>Level</th><th>Status</th><th className="text-end">Aktion</th></tr>
            </thead>
            <tbody>
              {registrations.map(r => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.verein}</td>
                  <td>{r.has_license ? 'Ja' : 'Nein'}</td>
                  <td>{r.experience_level}</td>
                  <td>{statusBadge(r.status)}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-success me-2" onClick={() => updateStatus(r.id, 'accepted')}>Accept</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => updateStatus(r.id, 'rejected')}>Reject</button>
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

export default AdminEventRegistrations;
