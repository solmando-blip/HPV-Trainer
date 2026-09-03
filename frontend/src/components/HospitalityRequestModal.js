import React, { useState, useContext } from 'react';
import axios from 'axios';
import { ToastContext } from '../context/ToastContext';

function HospitalityRequestModal({ host, onClose, onSuccess }) {
  const { addToast } = useContext(ToastContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [dateProposed, setDateProposed] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('hpv_token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(
        '/api/hospitality',
        { host_id: host.user_id, message, date_proposed: dateProposed || null },
        { headers }
      );
      addToast('Hospitier-Anfrage gesendet.', 'success');
      onSuccess();
    } catch (err) {
      addToast(err.response?.data?.message || 'Fehler beim Senden der Anfrage.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal d-block bg-dark bg-opacity-50" style={{ position: 'fixed', inset: 0 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Hospitier-Anfrage</h5>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">An welchen Trainer?</label>
                <input className="form-control" value={host.user_name} readOnly disabled />
              </div>
              <div className="mb-3">
                <label className="form-label">Warum möchte ich hospitieren?</label>
                <textarea className="form-control" rows="3" value={message} onChange={e => setMessage(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">Datum vorgeschlagen?</label>
                <input type="date" className="form-control" value={dateProposed} onChange={e => setDateProposed(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Abbrechen</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Sende...' : 'Anfrage senden'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default HospitalityRequestModal;
