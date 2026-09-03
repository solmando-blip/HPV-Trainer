import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import EventRegistrationModal from '../components/EventRegistrationModal';

function EventDetail({ user }) {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const fetchEvent = () => {
    axios.get(`/api/events/${id}`)
      .then(res => setEvent(res.data))
      .catch(() => setNotFound(true));
  };

  useEffect(() => { fetchEvent(); }, [id]);

  if (notFound) return <p className="text-muted">Event nicht gefunden.</p>;
  if (!event) return <p className="text-muted">Lädt...</p>;

  const isFull = event.max_participants > 0 && event.registered_count >= event.max_participants;
  const isPast = new Date(`${event.date}T${event.time}`) < new Date();

  return (
    <div>
      <h2 className="mb-2">{event.title}</h2>
      <p className="text-muted mb-1">
        {new Date(event.date).toLocaleDateString('de-DE')} · {event.time?.slice(0, 5)} Uhr · {event.location}
      </p>
      <p className="mb-3">Teilnehmer: {event.registered_count}/{event.max_participants}</p>
      <p>{event.description}</p>
      {event.agenda && (
        <>
          <h5 className="mt-4">Agenda</h5>
          <p>{event.agenda}</p>
        </>
      )}

      {isPast ? (
        <div className="alert alert-secondary mt-3">Anmeldung nicht mehr möglich (Deadline überschritten).</div>
      ) : isFull ? (
        <div className="alert alert-warning mt-3">Event ist voll.</div>
      ) : (
        <button className="btn btn-primary mt-3" onClick={() => setShowModal(true)}>Zur Anmeldung</button>
      )}

      {showModal && (
        <EventRegistrationModal
          event={event}
          user={user}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchEvent(); }}
        />
      )}
    </div>
  );
}

export default EventDetail;
