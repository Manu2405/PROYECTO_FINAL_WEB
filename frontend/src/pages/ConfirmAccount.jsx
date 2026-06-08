import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';

export default function ConfirmAccount() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const confirmedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Enlace de confirmación inválido.');
      return;
    }

    if (confirmedRef.current) return;
    confirmedRef.current = true;

    api.confirmAccount(token)
      .then((data) => {
        setStatus('success');
        setMessage(data.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message);
      });
  }, [token]);

  return (
    <div className="container" style={{ maxWidth: '480px', paddingTop: '60px', paddingBottom: '40px' }}>
      <div className="glass card" style={{ textAlign: 'center' }}>
        {status === 'loading' && <p>Confirmando tu cuenta...</p>}
        {status === 'success' && (
          <>
            <p className="success-msg">{message}</p>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: '16px' }}>Ir a iniciar sesión</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <p className="error-msg">{message}</p>
            <Link to="/login" className="btn btn-secondary" style={{ marginTop: '16px' }}>Volver al login</Link>
          </>
        )}
      </div>
    </div>
  );
}
