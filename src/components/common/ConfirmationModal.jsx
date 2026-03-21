import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title || 'Confirm Action'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p>{message || 'Are you sure?'}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-danger" onClick={onConfirm}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;