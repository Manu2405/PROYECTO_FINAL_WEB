import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDateOnly } from '../utils/time';

function HeartIcon({ filled, className = '' }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export default function Community() {
  const [publications, setPublications] = useState([]);
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [actionError, setActionError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.getPublications().then(setPublications).catch(() => {});
  }, []);

  const requireAuth = () => {
    if (!user) {
      setActionError('Inicia sesión para interactuar con las publicaciones.');
      navigate('/login');
      return false;
    }
    setActionError('');
    return true;
  };

  const handleLike = async (publication) => {
    if (!requireAuth()) return;
    try {
      const result = await api.votePublication(publication.id_publicacion, 'positivo');
      setPublications((prev) => prev.map((p) => (
        p.id_publicacion === publication.id_publicacion
          ? {
              ...p,
              votos_positivos: result.votos_positivos,
              mi_voto: result.mi_voto ?? (p.mi_voto === 'positivo' ? null : 'positivo'),
            }
          : p
      )));
    } catch (error) {
      setActionError(error.message);
    }
  };

  const handleToggleComments = async (publicationId) => {
    if (!comments[publicationId]) {
      try {
        const publicationComments = await api.getPublicationComments(publicationId);
        setComments((prev) => ({ ...prev, [publicationId]: publicationComments }));
      } catch (error) {
        setActionError(error.message);
        return;
      }
    }
    setShowComments((prev) => ({ ...prev, [publicationId]: !prev[publicationId] }));
  };

  const handleAddComment = async (publicationId) => {
    if (!requireAuth()) return;
    const contenido = newComment[publicationId];
    if (!contenido?.trim()) return;

    try {
      await api.createPublicationComment(publicationId, contenido.trim());
      setNewComment((prev) => ({ ...prev, [publicationId]: '' }));
      const publicationComments = await api.getPublicationComments(publicationId);
      setComments((prev) => ({ ...prev, [publicationId]: publicationComments }));
    } catch (error) {
      setActionError(error.message);
    }
  };

  const handleDeleteComment = async (publicationId, commentId) => {
    try {
      await api.deletePublicationComment(publicationId, commentId);
      const publicationComments = await api.getPublicationComments(publicationId);
      setComments((prev) => ({ ...prev, [publicationId]: publicationComments }));
    } catch (error) {
      setActionError(error.message);
    }
  };

  const fullName = (nombre, apellido) => `${nombre || ''} ${apellido || ''}`.trim();

  return (
    <div className="community-page">
      <div className="section-header">
        <h1>Comunidad</h1>
        {user?.rol === 'cliente' && (
          <Link to="/comunidad/publicar" className="btn btn-primary">Publicar</Link>
        )}
      </div>

      {actionError && <div className="error-msg community-action-error">{actionError}</div>}

      <div className="community-grid">
        {publications.map((p) => {
          const liked = p.mi_voto === 'positivo';
          const commentList = comments[p.id_publicacion] || [];

          return (
            <article key={p.id_publicacion} className="community-card glass">
              <div className="img-contain-wrap">
                <img src={p.imagen_url} alt={p.descripcion || 'Tatuaje'} />
              </div>

              <div className="community-card-body">
                {p.descripcion && (
                  <p className="community-description">{p.descripcion}</p>
                )}

                <div className="community-meta">
                  <div className="community-meta-row">
                    <span className="community-meta-label">Publicado por</span>
                    <span className="community-meta-name">
                      {fullName(p.cliente_nombre, p.cliente_apellido)}
                    </span>
                  </div>
                  <div className="community-meta-row community-meta-artist">
                    <span className="community-meta-label">Artista</span>
                    <span className="community-meta-name">
                      {fullName(p.artista_nombre, p.artista_apellido)}
                    </span>
                  </div>
                  <time className="community-date" dateTime={String(p.created_at || '').slice(0, 10)}>
                    {formatDateOnly(p.created_at)}
                  </time>
                </div>

                <div className="community-actions">
                  <button
                    type="button"
                    className={`like-button ${liked ? 'liked' : ''}`}
                    onClick={() => handleLike(p)}
                    aria-label={liked ? 'Quitar me gusta' : 'Dar me gusta'}
                    title={liked ? 'Quitar me gusta' : 'Me gusta'}
                  >
                    <HeartIcon filled={liked} className="heart-toggle" />
                  </button>

                  <span className="likes-count">
                    {p.votos_positivos || 0}
                    <HeartIcon filled className="heart-count" />
                  </span>

                  <button
                    type="button"
                    className="comment-toggle"
                    onClick={() => handleToggleComments(p.id_publicacion)}
                  >
                    Comentarios
                    {commentList.length > 0 && (
                      <span className="comment-count">{commentList.length}</span>
                    )}
                  </button>
                </div>

                {showComments[p.id_publicacion] && (
                  <div className="comments-section">
                    <div className="comments-list">
                      {commentList.length === 0 ? (
                        <p className="comments-empty">Sé el primero en comentar.</p>
                      ) : (
                        commentList.map((comment) => (
                          <div key={comment.id_comentario} className="comment-item">
                            <p className="comment-user">
                              {fullName(comment.usuario_nombre, comment.usuario_apellido)}
                            </p>
                            <p className="comment-content">{comment.contenido}</p>
                            {user && (user.id_usuario === comment.id_usuario || user.rol === 'admin') && (
                              <button
                                type="button"
                                className="delete-comment"
                                onClick={() => handleDeleteComment(p.id_publicacion, comment.id_comentario)}
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {user ? (
                      <div className="add-comment">
                        <textarea
                          className="comment-input"
                          placeholder="Escribe un comentario..."
                          value={newComment[p.id_publicacion] || ''}
                          onChange={(e) => setNewComment((prev) => ({
                            ...prev,
                            [p.id_publicacion]: e.target.value,
                          }))}
                          rows={2}
                        />
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAddComment(p.id_publicacion)}
                        >
                          Comentar
                        </button>
                      </div>
                    ) : (
                      <p className="comments-login-hint">
                        <Link to="/login">Inicia sesión</Link> para dejar un comentario.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
