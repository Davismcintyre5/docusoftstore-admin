import React, { useState } from 'react';

const ImageViewer = ({ url, onClose }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '90vw', 
          maxHeight: '90vh', 
          width: 'auto',
          padding: 0,
          background: 'white',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with controls */}
        <div style={{ 
          padding: '16px 20px', 
          borderBottom: '1px solid #e2e8f0', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>🖼️</span>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#2d3748' }}>
              Payment Screenshot
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Zoom controls */}
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: 'white',
                cursor: zoom <= 0.5 ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: zoom <= 0.5 ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              −
            </button>
            <span style={{ fontSize: '12px', color: '#718096', minWidth: '60px', textAlign: 'center' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: 'white',
                cursor: zoom >= 3 ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: zoom >= 3 ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              +
            </button>
            <button
              onClick={handleResetZoom}
              style={{
                padding: '0 12px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                color: '#4a5568'
              }}
            >
              Reset
            </button>
            <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 4px' }} />
            <button 
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: 'none',
                background: '#f56565',
                color: 'white',
                cursor: 'pointer',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#e53e3e'}
              onMouseLeave={(e) => e.target.style.background = '#f56565'}
            >
              ×
            </button>
          </div>
        </div>
        
        {/* Image content */}
        <div style={{ 
          padding: '24px', 
          textAlign: 'center', 
          maxHeight: 'calc(90vh - 80px)', 
          overflow: 'auto',
          background: '#f7fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px'
        }}>
          {!imageLoaded && !imageError && (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto', width: '40px', height: '40px' }}></div>
              <p style={{ marginTop: '16px', color: '#718096' }}>Loading screenshot...</p>
            </div>
          )}
          
          {imageError && (
            <div style={{ textAlign: 'center', padding: '60px', maxWidth: '400px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🖼️</div>
              <h3 style={{ color: '#c53030', marginBottom: '8px', fontSize: '18px' }}>Failed to load image</h3>
              <p style={{ color: '#718096', marginBottom: '16px', fontSize: '14px', wordBreak: 'break-all' }}>
                {url}
              </p>
              <p style={{ fontSize: '12px', color: '#a0aec0', marginBottom: '20px' }}>
                The screenshot file may be missing or the server cannot access it.
              </p>
              <button
                onClick={() => {
                  setImageError(false);
                  setImageLoaded(false);
                  const img = new Image();
                  img.onload = () => setImageLoaded(true);
                  img.onerror = () => setImageError(true);
                  img.src = url + '?t=' + Date.now();
                }}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#4299e1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                🔄 Retry
              </button>
            </div>
          )}
          
          <img 
            src={url} 
            alt="Payment Screenshot" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: 'calc(90vh - 140px)',
              width: 'auto',
              height: 'auto',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: imageLoaded && !imageError ? 'block' : 'none',
              transform: `scale(${zoom})`,
              transition: 'transform 0.2s ease',
              cursor: zoom > 1 ? 'zoom-out' : 'zoom-in'
            }} 
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            onClick={() => {
              if (zoom > 1) {
                handleResetZoom();
              } else {
                handleZoomIn();
              }
            }}
          />
        </div>
        
        {/* Footer with info */}
        <div style={{ 
          padding: '12px 20px', 
          borderTop: '1px solid #e2e8f0', 
          background: '#f8fafc',
          fontSize: '12px',
          color: '#718096',
          textAlign: 'center'
        }}>
          <span>💡 Tip: Click image to zoom • Use mouse wheel or buttons to zoom in/out</span>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;