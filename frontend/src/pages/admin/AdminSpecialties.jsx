import React, { useEffect, useState } from 'react';

import { api } from '../../utils/api';

import Modal from '../../components/Modal';



export default function AdminSpecialties() {

  const [list, setList] = useState([]);

  const [nombre, setNombre] = useState('');

  const [descripcion, setDescripcion] = useState('');

  const [viewItem, setViewItem] = useState(null);

  const [editItem, setEditItem] = useState(null);

  const [editNombre, setEditNombre] = useState('');

  const [editDescripcion, setEditDescripcion] = useState('');



  const load = () => api.getSpecialties().then(setList).catch(() => {});



  useEffect(() => { load(); }, []);



  const handleCreate = async (e) => {

    e.preventDefault();

    try {

      await api.createSpecialty(nombre, descripcion);

      setNombre('');

      setDescripcion('');

      load();

    } catch (e) {}

  };



  const openEdit = (s) => {

    setEditItem(s);

    setEditNombre(s.nombre);

    setEditDescripcion(s.descripcion || '');

  };



  const handleEdit = async (e) => {

    e.preventDefault();

    try {

      await api.updateSpecialty(editItem.id_especialidad, editNombre, editDescripcion);

      setEditItem(null);

      load();

    } catch (e) {}

  };



  const handleDelete = async (id) => {

    if (!window.confirm('¿Eliminar esta especialidad?')) return;

    try {

      await api.deleteSpecialty(id);

      load();

    } catch (e) {}

  };



  return (

    <div>

      <h1 style={{ marginBottom: '20px' }}>Especialidades</h1>

      <form onSubmit={handleCreate} className="glass card" style={{ marginBottom: '24px' }}>

        <div className="form-group">

          <label className="label">Nombre</label>

          <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} required />

        </div>

        <div className="form-group">

          <label className="label">Descripción</label>

          <input className="input" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />

        </div>

        <button type="submit" className="btn btn-primary">Crear</button>

      </form>

      {list.map((s) => (

        <div key={s.id_especialidad} className="glass card" style={{ marginBottom: '12px' }}>

          <p><strong>{s.nombre}</strong> — {s.descripcion}</p>

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>

            <button className="btn btn-secondary btn-sm" onClick={() => setViewItem(s)}>Ver</button>

            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)}>Editar</button>

            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id_especialidad)}>Eliminar</button>

          </div>

        </div>

      ))}



      {viewItem && (

        <Modal title={viewItem.nombre} onClose={() => setViewItem(null)}>

          <p><span className="text-muted">ID:</span> {viewItem.id_especialidad}</p>

          <p><span className="text-muted">Nombre:</span> {viewItem.nombre}</p>

          <p><span className="text-muted">Descripción:</span> {viewItem.descripcion || '—'}</p>

        </Modal>

      )}



      {editItem && (

        <Modal title="Editar especialidad" onClose={() => setEditItem(null)}>

          <form onSubmit={handleEdit}>

            <div className="form-group">

              <label className="label">Nombre</label>

              <input className="input" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} required />

            </div>

            <div className="form-group">

              <label className="label">Descripción</label>

              <input className="input" value={editDescripcion} onChange={(e) => setEditDescripcion(e.target.value)} />

            </div>

            <button type="submit" className="btn btn-primary">Guardar</button>

          </form>

        </Modal>

      )}

    </div>

  );

}

