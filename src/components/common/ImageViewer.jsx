import React, { useState } from 'react';

const ImageViewer = ({ url, onClose }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '90vw', maxHeight: '90vh', padding: 0, background: 'white', borderRadius: '24px', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Payment Screenshot</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#a0aec0', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
            ×
          </button>
        </div>
        <div style={{ padding: '20px', textAlign: 'center', maxHeight: '70vh', overflow: 'auto', background: '#f7fafc' }}>
          {!imageLoaded && !imageError && (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto' }}></div>
              <p style={{ marginTop: '16px', color: '#718096' }}>Loading screenshot...</p>
            </div>
          )}
          {imageError && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🖼️</div>
              <h3 style={{ color: '#c53030', marginBottom: '8px' }}>Failed to load image</h3>
              <p style={{ color: '#718096', marginBottom: '16px', wordBreak: 'break-all' }}>{url}</p>
              <p style={{ fontSize: '12px', color: '#a0aec0' }}>The screenshot file may be missing or the server cannot access it.</p>
              <button onClick={() => { setImageError(false); setImageLoaded(false); const img = new Image(); img.onload = () => setImageLoaded(true); img.onerror = () => setImageError(true); img.src = url + '?t=' + Date.now(); }} style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: '#4299e1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🔄 Retry</button>
            </div>
          )}
          <img src={url} alt="Payment Screenshot" style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: imageLoaded && !imageError ? 'block' : 'none' }} onLoad={() => setImageLoaded(true)} onError={() => setImageError(true)} />
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;