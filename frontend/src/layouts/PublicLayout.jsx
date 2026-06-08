import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function PublicLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div>
      <Navbar />
      <main className={isHome ? 'home-layout' : 'container'} style={isHome ? undefined : { paddingBottom: '40px' }}>
        <Outlet />
      </main>
    </div>
  );
}
