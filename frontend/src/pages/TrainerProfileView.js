import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import HospitalityRequestModal from '../components/HospitalityRequestModal';

function TrainerProfileView({ user }) {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    axios.get(`/api/trainer-profiles/${id}`)
      .then(res => setProfile(res.data))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) return <p className="text-muted">Trainer-Profil nicht gefunden.</p>;
  if (!profile) return <p className="text-muted">Lädt...</p>;

  const isOwnProfile = user && user.id === profile.user_id;

  return (
    <div>
      <h2 className="mb-2">{profile.user_name}</h2>
      <p className="text-muted mb-1">{profile.verein} {profile.region ? `· ${profile.region}` : ''}</p>
      <p className="mb-3">
        {profile.has_license ? 'Lizenzierter Trainer' : 'Keine Lizenz'} · {profile.experience_level}
      </p>
      <p>{profile.description}</p>

      {user && !isOwnProfile && profile.accepts_hospitality && (
        <button className="btn btn-primary mt-3" onClick={() => setShowModal(true)}>Hospitier-Anfrage</button>
      )}

      {showModal && (
        <HospitalityRequestModal
          host={profile}
          onClose={() => setShowModal(false)}
          onSuccess={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default TrainerProfileView;
