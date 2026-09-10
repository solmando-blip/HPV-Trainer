import React from 'react';
import { Link } from 'react-router-dom';

const TILES = [
  {
    mark: 'V',
    title: 'Veranstaltungen',
    text: 'Lehrgänge, Turniere und Trainertreffen mit Online-Anmeldung, Anmeldeschluss und Teilnehmerliste.',
    to: '/events',
    cta: 'Termine ansehen',
  },
  {
    mark: 'T',
    title: 'Trainer-Verzeichnis',
    text: 'Lizenzierte Trainerinnen und Trainer in Hessen finden – filterbar nach Verein, Region und Qualifikation.',
    to: '/trainer',
    cta: 'Verzeichnis öffnen',
  },
  {
    mark: 'N',
    title: 'News und Mitteilungen',
    text: 'Beschlüsse, Ankündigungen und Neuigkeiten aus dem Verband, chronologisch archiviert.',
    to: '/news',
    cta: 'Zu den Meldungen',
  },
  {
    mark: 'D',
    title: 'Dokumente',
    text: 'Regelwerke, Formulare und Lehrmaterial zum Ansehen und Herunterladen.',
    to: '/documents',
    cta: 'Downloads öffnen',
  },
];

function Home() {
  return (
    <div>
      <section className="tp-hero mb-5">
        <div style={{ maxWidth: '640px', position: 'relative', zIndex: 1 }}>
          <p className="tp-eyebrow mb-2">Hessischer Pétanque Verband</p>
          <h1 className="display-4 mb-3">Das Trainer-Portal</h1>
          <p className="lead mb-4">
            Die zentrale Arbeitsplattform für Trainerinnen und Trainer im hessischen
            Pétanque: Mitglieder verwalten, Trainingseinheiten planen und Termine
            koordinieren – an einem Ort.
          </p>
          <div className="d-flex flex-wrap gap-2">
            <Link to="/register" className="btn btn-primary btn-lg">Registrieren</Link>
            <Link to="/login" className="btn btn-outline-light btn-lg">Anmelden</Link>
          </div>
        </div>
      </section>

      <p className="tp-eyebrow mb-2">Im Portal</p>
      <h2 className="mb-4">Was du hier findest</h2>
      <div className="row g-4">
        {TILES.map((t) => (
          <div className="col-sm-6 col-lg-3" key={t.to}>
            <Link to={t.to} className="tp-tile">
              <span className="tp-tile__mark" aria-hidden="true">{t.mark}</span>
              <h3>{t.title}</h3>
              <p>{t.text}</p>
              <span className="tp-tile__cta">{t.cta} &rarr;</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
