import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function VerifyEmail() {
  const [params] = useSearchParams();
  const [message, setMessage] = useState('Verifiziere E-Mail...');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = params.get('token');

  useEffect(() => {
    if (!token) {
      setError('Kein Verifikations-Token gefunden.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await axios.post('/api/auth/verify-email', { token });
        setMessage(response.data.message);
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Verifikation fehlgeschlagen.');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="container py-5">
      <div className="col-md-6 mx-auto card card-body shadow-sm">
        <h2 className="mb-4">E-Mail-Bestätigung</h2>
        {message && <div className="alert alert-info">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <p className="text-muted">
          {!error && 'Sie werden in Kürze zur Anmeldung weitergeleitet...'}
        </p>
      </div>
    </div>
  );
}

export default VerifyEmail;
