import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ToastContext } from '../context/ToastContext';

const emptyForm = { title: '', description: '', date: '', time: '', location: '', agenda: '', max_participants: 0 };

function AdminEvents() {
  const { addToast } = useContext(ToastContext);
  const [events, setEvents] = useState([]);
  const [editEvent, setEditEvent] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const token = localStorage.getItem('hpv_token');
  const headers = { Authorization: `Bearer ${token}` };

  const loadEvents = () => {
    axios.get('/api/admin/event-registrations', { headers }).then(res => setEvents(res.data)).catch(err => console.error(err));
  };

  useEffect(() => { loadEvents(); }, []);

  const openCreate = () => { setForm(emptyForm); setShowCreate(true); };
  const openEdit = (ev) => {
    setEditEvent(ev);
    setForm({
      title: ev.title, description: ev.description || '', date: ev.date?.slice(0, 10),
      time: ev.time?.slice(0, 5), location: ev.location || '', agenda: ev.agenda || '',
      max_participants: ev.max_participants
    });
  };
  const closeModal = () => { setShowCreate(false); setEditEvent(null); };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'max_participants' ? parseInt(value) || 0 : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editEvent) {
        await axios.put(`/api/events/${editEvent.id}`, form, { headers });
        addToast('Event aktualisiert.', 'success');
      } else {
        await axios.post('/api/events', form, { headers });
        addToast('Event erstellt.', 'success');
      }
      closeModal();
      loadEvents();
    } catch (err) {
      addToast(err.response?.data?.message || 'Fehler beim Speichern.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Event wirklich löschen?')) return;
    try {
      await axios.delete(`/api/events/${id}`, { headers });
      addToast('Event gelöscht.', 'success');
      loadEvents();
    } catch (err) {
      addToast(err.response?.data?.message || 'Fehler beim Löschen.', 'error');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Events verwalten</h2>
        <button className="btn btn-success btn-sm" onClick={openCreate}>Event erstellen</button>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Title</th><th>Date</th><th>Time</th><th>Location</th><th>Max Participants</th><th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id}>
                  <td>{ev.title}</td>
                  <td>{new Date(ev.date).toLocaleDateString('de-DE')}</td>
                  <td>{ev.time?.slice(0, 5)}</td>
                  <td>{ev.location}</td>
                  <td>{ev.registered_count}/{ev.max_participants}</td>
                  <td className="text-end">
                    <Link to={`/admin/event-registrations/${ev.id}`} className="btn btn-sm btn-outline-secondary me-2">Anmeldungen</Link>
                    <button className="btn btn-sm btn-outline-warning me-2" onClick={() => openEdit(ev)}>Bearbeiten</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(ev.id)}>Löschen</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(showCreate || editEvent) && (
        <div className="modal d-block bg-dark bg-opacity-50" style={{ position: 'fixed', inset: 0 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">{editEvent ? 'Event bearbeiten' : 'Event erstellen'}</h5></div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Title</label>
                      <input className="form-control" name="title" value={form.title} onChange={handleChange} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description</label>
                      <textarea className="form-control" name="description" value={form.description} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Date</label>
                      <input type="date" className="form-control" name="date" value={form.date} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Time</label>
                      <input type="time" className="form-control" name="time" value={form.time} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Location</label>
                      <input className="form-control" name="location" value={form.location} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Max Participants</label>
                      <input type="number" min="0" className="form-control" name="max_participants" value={form.max_participants} onChange={handleChange} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Agenda</label>
                      <textarea className="form-control" name="agenda" value={form.agenda} onChange={handleChange} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Abbrechen</button>
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

export default AdminEvents;
