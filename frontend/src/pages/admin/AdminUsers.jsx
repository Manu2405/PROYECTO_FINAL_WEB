import React, { useEffect, useState } from 'react';

import { api } from '../../utils/api';

import Modal from '../../components/Modal';

import Toast from '../../components/Toast';



const emptyCreate = {

  nombre: '',

  apellido: '',

  email: '',

  password: '',

  telefono: '',

  rol: 'cliente',

  id_sucursal: '',

  horario_inicio: '10:00',

  horario_fin: '18:00',

};



const emptyEdit = {

  nombre: '',

  apellido: '',

  email: '',

  telefono: '',

  biografia: '',

  fecha_nacimiento: '',

  id_sucursal: '',

};



const ROL_LABELS = { cliente: 'Cliente', artista: 'Artista', admin: 'Administrador' };



export default function AdminUsers() {

  const [users, setUsers] = useState([]);

  const [branches, setBranches] = useState([]);

  const [createForm, setCreateForm] = useState(emptyCreate);

  const [editForm, setEditForm] = useState(emptyEdit);

  const [editId, setEditId] = useState(null);

  const [viewUser, setViewUser] = useState(null);

  const [toast, setToast] = useState('');

  const [msg, setMsg] = useState('');

  const [error, setError] = useState('');



  const load = () => api.getAllUsers().then(setUsers).catch(() => {});



  useEffect(() => {

    load();

    api.getBranchesAdmin().then(setBranches).catch(() => {});

  }, []);



  const handleCreate = async (e) => {

    e.preventDefault();

    setError('');

    try {

      const data = await api.createUserAdmin({

        ...createForm,

        id_sucursal: createForm.rol === 'artista' ? parseInt(createForm.id_sucursal, 10) : null,

        horario_inicio: createForm.rol === 'artista' ? createForm.horario_inicio : null,

        horario_fin: createForm.rol === 'artista' ? createForm.horario_fin : null,

      });

      setMsg(data.message);

      setCreateForm(emptyCreate);

      load();

    } catch (err) {

      setError(err.message);

    }

  };



  const openEdit = async (id) => {

    try {

      const user = await api.getUserById(id);

      setEditId(id);

      setEditForm({

        nombre: user.nombre,

        apellido: user.apellido,

        email: user.email,

        telefono: user.telefono || '',

        biografia: user.biografia || '',

        fecha_nacimiento: user.fecha_nacimiento ? user.fecha_nacimiento.split('T')[0] : '',

        id_sucursal: user.id_sucursal || '',

        rol: user.rol,

      });

    } catch (err) {

      setToast(err.message);

    }

  };



  const handleEdit = async (e) => {

    e.preventDefault();

    try {

      await api.updateUserAdmin(editId, {

        ...editForm,

        id_sucursal: editForm.rol === 'artista' ? parseInt(editForm.id_sucursal, 10) : null,

      });

      setEditId(null);

      setToast('Usuario actualizado correctamente');

      load();

    } catch (err) {

      setToast(err.message);

    }

  };



  const openView = async (id) => {

    try {

      const user = await api.getUserById(id);

      setViewUser(user);

    } catch (err) {

      setToast(err.message);

    }

  };



  const toggleStatus = async (user) => {

    const action = user.estado ? 'desactivar' : 'activar';

    const confirmed = window.confirm(

      `¿Estás seguro de que deseas ${action} a ${user.nombre} ${user.apellido}?`

    );

    if (!confirmed) return;



    try {

      const result = await api.toggleUserStatus(user.id_usuario, !user.estado);

      setToast(

        result.usuario?.estado

          ? `${user.nombre} ${user.apellido} ahora está activo`

          : `${user.nombre} ${user.apellido} ahora está inactivo`

      );

      load();

    } catch (err) {

      setToast(err.message);

    }

  };



  return (

    <div>

      <Toast message={toast} type={toast.includes('inactivo') || toast.includes('Error') ? 'info' : 'success'} onClose={() => setToast('')} />



      <h1 style={{ marginBottom: '20px' }}>Usuarios</h1>



      <form onSubmit={handleCreate} className="glass card" style={{ marginBottom: '24px' }}>

        <h3 style={{ marginBottom: '12px' }}>Crear usuario</h3>

        <p className="text-muted text-sm" style={{ marginBottom: '16px' }}>

          Se enviará un correo de confirmación al email indicado. La cuenta se activará cuando confirme el enlace.

        </p>

        {msg && <div className="success-msg">{msg}</div>}

        {error && <div className="error-msg">{error}</div>}

        <div className="grid-2">

          <div className="form-group">

            <label className="label">Nombre</label>

            <input className="input" value={createForm.nombre} onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })} required />

          </div>

          <div className="form-group">

            <label className="label">Apellido</label>

            <input className="input" value={createForm.apellido} onChange={(e) => setCreateForm({ ...createForm, apellido: e.target.value })} required />

          </div>

          <div className="form-group">

            <label className="label">Email</label>

            <input className="input" type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} required />

          </div>

          <div className="form-group">

            <label className="label">Contraseña temporal</label>

            <input className="input" type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} required />

          </div>

          <div className="form-group">

            <label className="label">Teléfono</label>

            <input className="input" value={createForm.telefono} onChange={(e) => setCreateForm({ ...createForm, telefono: e.target.value })} />

          </div>

          <div className="form-group">

            <label className="label">Rol</label>

            <select className="select" value={createForm.rol} onChange={(e) => setCreateForm({ ...createForm, rol: e.target.value })}>

              <option value="cliente">Cliente</option>

              <option value="artista">Artista</option>

              <option value="admin">Administrador</option>

            </select>

          </div>

          {createForm.rol === 'artista' && (

            <div className="form-group">

              <label className="label">Sucursal</label>

              <select className="select" value={createForm.id_sucursal} onChange={(e) => setCreateForm({ ...createForm, id_sucursal: e.target.value })} required>

                <option value="">Seleccionar...</option>

                {branches.map((b) => (

                  <option key={b.id_sucursal} value={b.id_sucursal}>{b.nombre}</option>

                ))}

              </select>

            </div>

          )}

          {createForm.rol === 'artista' && (

            <>

              <div className="form-group">

                <label className="label">Horario inicio</label>

                <input className="input" type="time" value={createForm.horario_inicio} onChange={(e) => setCreateForm({ ...createForm, horario_inicio: e.target.value })} required />

              </div>

              <div className="form-group">

                <label className="label">Horario fin</label>

                <input className="input" type="time" value={createForm.horario_fin} onChange={(e) => setCreateForm({ ...createForm, horario_fin: e.target.value })} required />

              </div>

            </>

          )}

        </div>

        <button type="submit" className="btn btn-primary">Crear y enviar confirmación</button>

      </form>



      {users.map((u) => (

        <div key={u.id_usuario} className="glass card" style={{ marginBottom: '12px' }}>

          <p><strong>{u.nombre} {u.apellido}</strong> — {u.email}</p>

          <p>Rol: {ROL_LABELS[u.rol] || u.rol} — {u.estado ? 'Activo' : 'Inactivo'}</p>

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>

            <button className="btn btn-secondary btn-sm" onClick={() => openView(u.id_usuario)}>Ver</button>

            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u.id_usuario)}>Editar</button>

            <button className="btn btn-secondary btn-sm" onClick={() => toggleStatus(u)}>

              {u.estado ? 'Desactivar' : 'Activar'}

            </button>

          </div>

        </div>

      ))}



      {viewUser && (

        <Modal title={`${viewUser.nombre} ${viewUser.apellido}`} onClose={() => setViewUser(null)}>

          <div className="user-detail-grid">

            <p><span className="text-muted">Email:</span> {viewUser.email}</p>

            <p><span className="text-muted">Teléfono:</span> {viewUser.telefono || '—'}</p>

            <p><span className="text-muted">Rol:</span> {ROL_LABELS[viewUser.rol] || viewUser.rol}</p>

            <p><span className="text-muted">Estado:</span> {viewUser.estado ? 'Activo' : 'Inactivo'}</p>

            <p><span className="text-muted">Sucursal:</span> {viewUser.sucursal_nombre || '—'}</p>

            <p><span className="text-muted">Biografía:</span> {viewUser.biografia || '—'}</p>

            <p><span className="text-muted">Fecha de nacimiento:</span> {viewUser.fecha_nacimiento ? viewUser.fecha_nacimiento.split('T')[0] : '—'}</p>

            <p><span className="text-muted">Registro:</span> {viewUser.fecha_registro ? new Date(viewUser.fecha_registro).toLocaleDateString('es-BO') : '—'}</p>

            <p><span className="text-muted">Último login:</span> {viewUser.ultimo_login ? new Date(viewUser.ultimo_login).toLocaleString('es-BO') : '—'}</p>

          </div>

        </Modal>

      )}



      {editId && (

        <Modal title="Editar usuario" onClose={() => setEditId(null)}>

          <form onSubmit={handleEdit}>

            <div className="form-group">

              <label className="label">Nombre</label>

              <input className="input" value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} required />

            </div>

            <div className="form-group">

              <label className="label">Apellido</label>

              <input className="input" value={editForm.apellido} onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })} required />

            </div>

            <div className="form-group">

              <label className="label">Email</label>

              <input className="input" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required />

            </div>

            <div className="form-group">

              <label className="label">Teléfono</label>

              <input className="input" value={editForm.telefono} onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })} />

            </div>

            <div className="form-group">

              <label className="label">Biografía</label>

              <textarea className="textarea" rows={3} value={editForm.biografia} onChange={(e) => setEditForm({ ...editForm, biografia: e.target.value })} />

            </div>

            <div className="form-group">

              <label className="label">Fecha de nacimiento</label>

              <input className="input" type="date" value={editForm.fecha_nacimiento} onChange={(e) => setEditForm({ ...editForm, fecha_nacimiento: e.target.value })} />

            </div>

            {editForm.rol === 'artista' && (

              <div className="form-group">

                <label className="label">Sucursal</label>

                <select className="select" value={editForm.id_sucursal} onChange={(e) => setEditForm({ ...editForm, id_sucursal: e.target.value })}>

                  <option value="">Sin sucursal</option>

                  {branches.map((b) => (

                    <option key={b.id_sucursal} value={b.id_sucursal}>{b.nombre}</option>

                  ))}

                </select>

              </div>

            )}

            <button type="submit" className="btn btn-primary">Guardar cambios</button>

          </form>

        </Modal>

      )}

    </div>

  );

}

