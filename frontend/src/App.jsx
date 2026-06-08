import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ConfirmAccount from './pages/ConfirmAccount';
import Branches from './pages/Branches';
import BranchDetail from './pages/BranchDetail';
import Portfolio from './pages/Portfolio';
import Artists from './pages/Artists';
import ArtistProfile from './pages/ArtistProfile';
import Community from './pages/Community';
import Reservar from './pages/Reservar';
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';
import Profile from './pages/Profile';

import ClientDashboard from './pages/cliente/ClientDashboard';
import ClientBookings from './pages/cliente/ClientBookings';
import ClientBookingDetail from './pages/cliente/ClientBookingDetail';
import Loyalty from './pages/cliente/Loyalty';
import Redeem from './pages/cliente/Redeem';
import NewPublication from './pages/cliente/NewPublication';

import ArtistDashboard from './pages/artista/ArtistDashboard';
import ArtistBookings from './pages/artista/ArtistBookings';
import ArtistBookingDetail from './pages/artista/ArtistBookingDetail';
import ArtistPortfolio from './pages/artista/ArtistPortfolio';
import DesignForm from './pages/artista/DesignForm';
import Specialties from './pages/artista/Specialties';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminPayments from './pages/admin/AdminPayments';
import AdminBranches from './pages/admin/AdminBranches';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSpecialties from './pages/admin/AdminSpecialties';
import AdminReviews from './pages/admin/AdminReviews';
import AdminPublications from './pages/admin/AdminPublications';
import AdminLoyalty from './pages/admin/AdminLoyalty';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/confirmar-cuenta" element={<ConfirmAccount />} />
            <Route path="/sucursales" element={<Branches />} />
            <Route path="/sucursales/:id" element={<BranchDetail />} />
            <Route path="/estilos" element={<Portfolio />} />
            <Route path="/portafolio" element={<Navigate to="/estilos" replace />} />
            <Route path="/artistas" element={<Artists />} />
            <Route path="/artistas/:id" element={<ArtistProfile />} />
            <Route path="/comunidad" element={<Community />} />
            <Route path="/reservar" element={
              <ProtectedRoute roles={['cliente']}>
                <Reservar />
              </ProtectedRoute>
            } />
            <Route path="/comunidad/publicar" element={
              <ProtectedRoute roles={['cliente']}>
                <NewPublication />
              </ProtectedRoute>
            } />
            <Route path="/sin-permiso" element={<Forbidden />} />
          </Route>

          <Route path="/cliente" element={
            <ProtectedRoute roles={['cliente']}>
              <DashboardLayout role="cliente" />
            </ProtectedRoute>
          }>
            <Route index element={<ClientDashboard />} />
            <Route path="reservas" element={<ClientBookings />} />
            <Route path="reservas/:id" element={<ClientBookingDetail />} />
            <Route path="fidelidad" element={<Loyalty />} />
            <Route path="fidelidad/canjear" element={<Redeem />} />
            <Route path="perfil" element={<Profile />} />
          </Route>

          <Route path="/artista" element={
            <ProtectedRoute roles={['artista']}>
              <DashboardLayout role="artista" />
            </ProtectedRoute>
          }>
            <Route index element={<ArtistDashboard />} />
            <Route path="reservas" element={<ArtistBookings />} />
            <Route path="reservas/:id" element={<ArtistBookingDetail />} />
            <Route path="portafolio" element={<ArtistPortfolio />} />
            <Route path="portafolio/nuevo" element={<DesignForm />} />
            <Route path="portafolio/:id" element={<DesignForm />} />
            <Route path="especialidades" element={<Specialties />} />
            <Route path="perfil" element={<Profile />} />
          </Route>

          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <DashboardLayout role="admin" />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="reservas" element={<AdminBookings />} />
            <Route path="pagos" element={<AdminPayments />} />
            <Route path="sucursales" element={<AdminBranches />} />
            <Route path="usuarios" element={<AdminUsers />} />
            <Route path="especialidades" element={<AdminSpecialties />} />
            <Route path="resenas" element={<AdminReviews />} />
            <Route path="publicaciones" element={<AdminPublications />} />
            <Route path="fidelidad" element={<AdminLoyalty />} />
            <Route path="perfil" element={<Profile />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
