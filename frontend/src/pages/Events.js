import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get('/api/events').then(res => setEvents(res.data)).catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2 className="mb-4">📅 Events</h2>
      {events.length === 0 ? (
        <p className="text-muted">Aktuell sind keine Events geplant.</p>
      ) : (
        <div className="row g-3">
          {events.map(ev => (
            <div className="col-md-6 col-lg-4" key={ev.id}>
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{ev.title}</h5>
                  <p className="card-text text-muted small mb-1">
                    {new Date(ev.date).toLocaleDateString('de-DE')} · {ev.time?.slice(0, 5)} Uhr
                  </p>
                  <p className="card-text text-muted small mb-2">{ev.location}</p>
                  <p className="card-text flex-grow-1">{ev.description}</p>
                  <p className="card-text small">
                    Teilnehmer: {ev.registered_count}/{ev.max_participants}
                  </p>
                  <Link to={`/events/${ev.id}`} className="btn btn-primary btn-sm mt-auto">Details</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Events;
