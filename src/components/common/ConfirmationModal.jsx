import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
  if (!isOpen) return null;

  const typeColors = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    success: 'bg-green-600 hover:bg-green-700',
    info: 'bg-blue-600 hover:bg-blue-700',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className={`${type === 'danger' ? 'text-red-500' : 'text-yellow-500'}`} size={24} />
            <p className="text-gray-600 dark:text-gray-300">{message}</p>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="btn-secondary">
              {cancelText}
            </button>
            <button onClick={onConfirm} className={`${typeColors[type]} text-white px-4 py-2 rounded-lg transition`}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;