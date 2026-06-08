import React, { useEffect, useRef, useState } from 'react';

export default function FileUpload({
  label,
  accept = 'image/*',
  onChange,
  fileName,
  previewUrl,
  hint = 'Haz clic o arrastra un archivo aquí',
}) {
  const inputRef = useRef(null);
  const [localPreview, setLocalPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const isImage = accept.includes('image');
  const displayPreview = localPreview || previewUrl;

  useEffect(() => () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  const handleFile = (file) => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    if (file && isImage && file.type.startsWith('image/')) {
      setLocalPreview(URL.createObjectURL(file));
    } else {
      setLocalPreview(null);
    }
    onChange(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="file-upload">
      <label className="label">{label}</label>
      {isImage && displayPreview && (
        <div className="file-upload-preview">
          <img src={displayPreview} alt="Vista previa" />
        </div>
      )}
      <div
        className={`file-upload-zone${dragOver ? ' file-upload-zone--dragover' : ''}`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
      >
        {isImage && displayPreview ? (
          <span className="file-upload-change">Haz clic o arrastra para cambiar la imagen</span>
        ) : (
          <>
            <span className="file-upload-icon" aria-hidden="true" />
            <span>{fileName || hint}</span>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="file-upload-input"
        onChange={(e) => handleFile(e.target.files[0] || null)}
      />
    </div>
  );
}
