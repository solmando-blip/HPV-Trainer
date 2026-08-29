import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <div className="p-5 mb-4 bg-light rounded-3 shadow-sm text-center">
        <h1 className="display-4 fw-bold">Willkommen beim HPV Trainer Portal</h1>
        <p className="lead">Die zentrale Plattform des Hessischen Pétanque Verbandes zur Verwaltung von Mitgliedern, Trainingseinheiten und Terminen.</p>
        <Link to="/register" className="btn btn-primary btn-lg">Jetzt Registrieren</Link>
      </div>
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title text-primary">📢 Aktuelles & News</h5>
              <p className="card-text">Bleiben Sie stets informiert über aktuelle Geschehnisse und Mitteilungen des Verbandes.</p>
              <Link to="/news" className="btn btn-outline-primary btn-sm">Zu den News</Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title text-primary">📁 Dokumente & Downloads</h5>
              <p className="card-text">Greifen Sie auf Regelwerke, Formulare und Verbandsdokumente jederzeit zu.</p>
              <Link to="/documents" className="btn btn-outline-primary btn-sm">Zu den Dokumenten</Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title text-primary">👥 Vernetzung & Gruppen</h5>
              <p className="card-text">Verwaltung von Trainergruppen und direkter Austausch innerhalb der Teams.</p>
              <Link to="/contact" className="btn btn-outline-primary btn-sm">Kontakt Aufnehmen</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
