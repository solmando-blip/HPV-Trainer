import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

function Header({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-xl navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">Trainer-Portal</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a
                className="nav-link"
                href="https://swiss-pair-pro.base44.app/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Turniersoftware <span aria-hidden="true">↗</span>
              </a>
            </li>
            <li className="nav-item"><NavLink className="nav-link" to="/" end>Home</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/events">Events</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/trainer">Trainer</NavLink></li>
            {user && (
              <li className="nav-item"><NavLink className="nav-link" to="/hospitality">Hospitieren</NavLink></li>
            )}
            <li className="nav-item"><NavLink className="nav-link" to="/news">News</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/documents">Dokumente</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/contact">Kontakt</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="/legal">Rechtliches</NavLink></li>
            {user && ['Admin', 'Moderator'].includes(user.role) && (
              <li className="nav-item"><NavLink className="nav-link tp-nav-admin" to="/admin">Admin</NavLink></li>
            )}
          </ul>
          <div className="d-flex align-items-center gap-2">
            {user ? (
              <>
                <span className="text-light me-1 d-none d-xxl-inline">Hallo, <strong>{user.name}</strong></span>
                <Link className="btn btn-outline-light btn-sm me-2" to="/profile">Profil</Link>
                <button className="btn btn-outline-light btn-sm" onClick={handleLogoutClick}>Abmelden</button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-light btn-sm me-2" to="/login">Login</Link>
                <Link className="btn btn-light btn-sm" to="/register">Registrieren</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
