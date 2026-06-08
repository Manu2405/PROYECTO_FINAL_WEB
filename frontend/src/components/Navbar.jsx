import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';
import { BRAND_NAME } from '../utils/constants';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand-logo">
          INK<span>HOUSE</span>
        </Link>
        <div className="navbar-links">
          <Link to="/">Inicio</Link>
          <Link to="/sucursales">Sucursales</Link>
          <Link to="/estilos">Tatuajes</Link>
          <Link to="/artistas">Artistas</Link>
          <Link to="/comunidad">Comunidad</Link>
          {!user && (
            <>
              <Link to="/login">Entrar</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Registro</Link>
            </>
          )}
          {user && <UserMenu />}
        </div>
      </div>
    </nav>
  );
}
