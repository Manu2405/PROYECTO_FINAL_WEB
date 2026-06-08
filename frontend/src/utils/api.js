const API_URL = '/api'; // Vite reverse-proxies this to http://localhost:5000

// Helper para obtener token y cabeceras
const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('token');
  const headers = {};
  
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Algo salió mal en el servidor.');
  }
  return data;
};

export const api = {
  // ==========================================
  // AUTENTICACIÓN Y USUARIOS
  // ==========================================
  async login(email, password) {
    const res = await fetch(`${API_URL}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  async register(formData) {
    const res = await fetch(`${API_URL}/usuarios/register`, {
      method: 'POST',
      headers: getHeaders(true), // multipart/form-data
      body: formData
    });
    return handleResponse(res);
  },

  async confirmAccount(token) {
    const res = await fetch(`${API_URL}/usuarios/confirmar/${token}`, {
      method: 'GET',
    });
    return handleResponse(res);
  },

  async getProfile() {
    const res = await fetch(`${API_URL}/usuarios/profile`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async updateProfile(formData) {
    const res = await fetch(`${API_URL}/usuarios/profile`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: formData
    });
    return handleResponse(res);
  },

  async getArtists() {
    const res = await fetch(`${API_URL}/usuarios/artists`, {
      method: 'GET'
    });
    return handleResponse(res);
  },

  async getAllUsers() {
    const res = await fetch(`${API_URL}/usuarios`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createUserAdmin(data) {
    const res = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getUserById(id) {
    const res = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async updateUserAdmin(id, data) {
    const res = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async toggleUserStatus(id, estado) {
    const res = await fetch(`${API_URL}/usuarios/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ estado })
    });
    return handleResponse(res);
  },

  // ==========================================
  // SUCURSALES
  // ==========================================
  async getBranches() {
    const res = await fetch(`${API_URL}/sucursales`, {
      method: 'GET'
    });
    return handleResponse(res);
  },

  async getBranchById(id) {
    const res = await fetch(`${API_URL}/sucursales/${id}`, { method: 'GET' });
    return handleResponse(res);
  },

  async getBranchesAdmin() {
    const res = await fetch(`${API_URL}/sucursales/admin/all`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createBranch(data) {
  const res = await fetch(`${API_URL}/sucursales`, {
    method: 'POST',
    headers: getHeaders(true),
    body: data
  });
  return handleResponse(res);
},

async updateBranch(id, data) {
  const res = await fetch(`${API_URL}/sucursales/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: data
  });
  return handleResponse(res);
},

  async deleteBranch(id) {
    const res = await fetch(`${API_URL}/sucursales/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // ==========================================
  // ESPECIALIDADES
  // ==========================================
  async getArtistSpecialties(artistId) {
    const res = await fetch(`${API_URL}/especialidades/artist/${artistId}`, {
      method: 'GET'
    });
    return handleResponse(res);
  },

  async getSpecialties() {
    const res = await fetch(`${API_URL}/especialidades`, {
      method: 'GET'
    });
    return handleResponse(res);
  },

  async updateArtistSpecialties(especialidadesIds) {
    const res = await fetch(`${API_URL}/especialidades/artist`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ especialidadesIds })
    });
    return handleResponse(res);
  },

  async createSpecialty(nombre, descripcion) {
    const res = await fetch(`${API_URL}/especialidades`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ nombre, descripcion })
    });
    return handleResponse(res);
  },

  async updateSpecialty(id, nombre, descripcion) {
    const res = await fetch(`${API_URL}/especialidades/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ nombre, descripcion }),
    });
    return handleResponse(res);
  },

  async deleteSpecialty(id) {
    const res = await fetch(`${API_URL}/especialidades/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // ==========================================
  // DISEÑOS (PORTAFOLIO)
  // ==========================================
  async getDesigns() {
    const res = await fetch(`${API_URL}/disenos`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createDesign(formData) {
    const res = await fetch(`${API_URL}/disenos`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    return handleResponse(res);
  },

  async updateDesign(id, formData) {
    const res = await fetch(`${API_URL}/disenos/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: formData
    });
    return handleResponse(res);
  },

  async deleteDesign(id) {
    const res = await fetch(`${API_URL}/disenos/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async likeDesign(id) {
    const res = await fetch(`${API_URL}/disenos/${id}/like`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getAvailability(artistId, fecha, duracion = 1) {
    const res = await fetch(
      `${API_URL}/reservas/disponibilidad/${artistId}?fecha=${fecha}&duracion=${duracion}`
    );
    return handleResponse(res);
  },

  async getAvailabilityMonth(artistId, year, month, duracion = 1) {
    const res = await fetch(
      `${API_URL}/reservas/disponibilidad/${artistId}?year=${year}&month=${month}&duracion=${duracion}`
    );
    return handleResponse(res);
  },

  // ==========================================
  // RESERVAS
  // ==========================================
  async getAllBookings() {
    const res = await fetch(`${API_URL}/reservas`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getMyBookings() {
    const res = await fetch(`${API_URL}/reservas/my-bookings`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getArtistBookings() {
    const res = await fetch(`${API_URL}/reservas/artist-bookings`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getBookingById(id) {
    const res = await fetch(`${API_URL}/reservas/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createBooking(formData) {
    const res = await fetch(`${API_URL}/reservas`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    return handleResponse(res);
  },

  async updateBookingStatus(id, estado, observaciones) {
    const res = await fetch(`${API_URL}/reservas/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ estado, observaciones })
    });
    return handleResponse(res);
  },

  async updateBookingEstimation(id, precio_estimado, adelanto) {
    const res = await fetch(`${API_URL}/reservas/${id}/estimation`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ precio_estimado, adelanto })
    });
    return handleResponse(res);
  },

  // ==========================================
  // SESIONES
  // ==========================================
  async getSessions(bookingId) {
    const res = await fetch(`${API_URL}/sesiones/booking/${bookingId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createSession(data) {
    const res = await fetch(`${API_URL}/sesiones`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateSession(id, data) {
    const res = await fetch(`${API_URL}/sesiones/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteSession(id) {
    const res = await fetch(`${API_URL}/sesiones/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // ==========================================
  // PAGOS
  // ==========================================
  async getPayments(bookingId) {
    const res = await fetch(`${API_URL}/pagos/booking/${bookingId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createPayment(formData) {
    const res = await fetch(`${API_URL}/pagos`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    return handleResponse(res);
  },

  async updatePaymentStatus(id, estado) {
    const res = await fetch(`${API_URL}/pagos/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ estado })
    });
    return handleResponse(res);
  },

  async getAllPayments() {
    const res = await fetch(`${API_URL}/pagos`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // ==========================================
  // RESEÑAS
  // ==========================================
  async getReviewsByArtist(artistId) {
    const res = await fetch(`${API_URL}/resenas/artist/${artistId}`, {
      method: 'GET'
    });
    return handleResponse(res);
  },

  async createReview(data) {
    const res = await fetch(`${API_URL}/resenas`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getAllReviews() {
    const res = await fetch(`${API_URL}/resenas`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async toggleReviewStatus(id, estado) {
    const res = await fetch(`${API_URL}/resenas/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ estado })
    });
    return handleResponse(res);
  },

  // ==========================================
  // MURAL COMUNITARIO (PUBLICACIONES)
  // ==========================================
  async getPublications() {
    const headers = {};
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const res = await fetch(`${API_URL}/publicaciones`, {
      method: 'GET',
      headers
    });
    return handleResponse(res);
  },

  async createPublication(formData) {
    const res = await fetch(`${API_URL}/publicaciones`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    return handleResponse(res);
  },

  async votePublication(id, tipo_voto) {
    const res = await fetch(`${API_URL}/publicaciones/${id}/vote`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ tipo_voto })
    });
    return handleResponse(res);
  },

  async deletePublication(id) {
    const res = await fetch(`${API_URL}/publicaciones/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getPublicationComments(id) {
    const headers = {};
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const res = await fetch(`${API_URL}/publicaciones/${id}/comments`, {
      method: 'GET',
      headers
    });
    return handleResponse(res);
  },

  async createPublicationComment(id, contenido) {
    const res = await fetch(`${API_URL}/publicaciones/${id}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ contenido })
    });
    return handleResponse(res);
  },

  async deletePublicationComment(publicationId, commentId) {
    const res = await fetch(`${API_URL}/publicaciones/${publicationId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // ==========================================
  // PROGRAMA DE FIDELIZACIÓN (PUNTOS)
  // ==========================================
  async getMyPoints() {
    const res = await fetch(`${API_URL}/fidelidad/my-level`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async redeemPoints(bloques) {
    const res = await fetch(`${API_URL}/fidelidad/canjear`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ bloques })
    });
    return handleResponse(res);
  },

  async getMyPointsHistory() {
    const res = await fetch(`${API_URL}/fidelidad/my-history`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async searchClientsLoyalty(query) {
    const res = await fetch(`${API_URL}/fidelidad/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getClientPointsAdmin(clientId) {
    const res = await fetch(`${API_URL}/fidelidad/client/${clientId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // ==========================================
  // AUXILIARES LOCALES
  // ==========================================
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
};
