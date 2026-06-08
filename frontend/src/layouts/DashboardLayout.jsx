import React from 'react';

import { Link, Outlet, useLocation } from 'react-router-dom';

import Navbar from '../components/Navbar';



const clientLinks = [

  { to: '/', label: 'Inicio' },

  { to: '/cliente/reservas', label: 'Mis reservas' },

  { to: '/cliente/fidelidad', label: 'Fidelidad' },

  { to: '/cliente/fidelidad/canjear', label: 'Canjear puntos' },

  { to: '/cliente/perfil', label: 'Mi perfil' },

];



const artistLinks = [

  { to: '/', label: 'Inicio' },

  { to: '/artista/reservas', label: 'Reservas' },

  { to: '/artista/portafolio', label: 'Portafolio' },

  { to: '/artista/especialidades', label: 'Especialidades' },

  { to: '/artista/perfil', label: 'Mi perfil' },

];



const adminLinks = [

  { to: '/admin', label: 'Panel de control' },

  { to: '/admin/reservas', label: 'Reservas' },

  { to: '/admin/pagos', label: 'Pagos' },

  { to: '/admin/sucursales', label: 'Sucursales' },

  { to: '/admin/usuarios', label: 'Usuarios' },

  { to: '/admin/especialidades', label: 'Especialidades' },

  { to: '/admin/resenas', label: 'Reseñas' },

  { to: '/admin/publicaciones', label: 'Publicaciones' },

  { to: '/admin/fidelidad', label: 'Fidelidad' },

  { to: '/admin/perfil', label: 'Mi perfil' },

];



export default function DashboardLayout({ role }) {

  const location = useLocation();

  const links = role === 'admin' ? adminLinks : role === 'artista' ? artistLinks : clientLinks;



  const isActive = (to) => location.pathname === to || (to !== `/${role}` && location.pathname.startsWith(to));



  return (

    <div>

      <Navbar />

      <div className="container dashboard-shell">

        <aside className="glass dashboard-sidebar">

          {links.map((link) => (

            <Link

              key={link.to}

              to={link.to}

              className={`sidebar-link ${isActive(link.to) ? 'active' : ''}`}

            >

              {link.label}

            </Link>

          ))}

        </aside>

        <div className="dashboard-main">

          <Outlet />

        </div>

      </div>

    </div>

  );

}

