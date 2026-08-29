import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Header({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">🎯 HPV Trainer</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/news">News</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/documents">Dokumente</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/contact">Kontakt</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/legal">Rechtliches</Link></li>
            {user && ['Admin', 'Moderator'].includes(user.role) && (
              <li className="nav-item"><Link className="nav-link fw-bold text-warning" to="/admin">Admin Panel</Link></li>
            )}
          </ul>
          <div className="d-flex align-items-center">
            {user ? (
              <>
                <span className="text-light me-3">Hallo, <strong>{user.name}</strong></span>
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
