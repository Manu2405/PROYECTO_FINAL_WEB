import React, { useEffect, useRef, useState } from 'react';

export default function MultiFileUpload({
  label,
  accept = 'image/*',
  files = [],
  onChange,
  maxFiles = 5,
  existingUrls = [],
  hint = 'Haz clic o arrastra imágenes aquí',
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const addFiles = (incoming) => {
    const valid = Array.from(incoming).filter((f) => f.type.startsWith('image/'));
    if (!valid.length) return;
    const remaining = maxFiles - files.length;
    if (remaining <= 0) return;
    onChange([...files, ...valid.slice(0, remaining)]);
  };

  const removeFile = (index) => {
    onChange(files.filter((_, i) => i !== index));
  };

  const remaining = maxFiles - files.length;
  const canAddMore = remaining > 0;

  return (
    <div className="file-upload">
      <label className="label">{label}</label>
      {(existingUrls.length > 0 || previews.length > 0) && (
        <div className="multi-file-preview-grid">
          {existingUrls.map((url, i) => (
            <div key={`existing-${i}`} className="multi-file-preview-item">
              <img src={url} alt={`Imagen actual ${i + 1}`} />
              <span className="multi-file-badge">Actual</span>
            </div>
          ))}
          {previews.map((url, i) => (
            <div key={`new-${i}`} className="multi-file-preview-item">
              <img src={url} alt={`Nueva imagen ${i + 1}`} />
              <button
                type="button"
                className="multi-file-remove"
                onClick={() => removeFile(i)}
                aria-label="Quitar imagen"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {canAddMore && (
        <div
          className={`file-upload-zone${dragOver ? ' file-upload-zone--dragover' : ''}`}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            addFiles(e.dataTransfer.files);
          }}
          role="button"
          tabIndex={0}
        >
          <span className="file-upload-icon" aria-hidden="true" />
          <span>{hint}</span>
          <span className="text-muted text-sm" style={{ display: 'block', marginTop: '6px' }}>
            {files.length}/{maxFiles} imágenes nuevas
          </span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="file-upload-input"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
