import React from 'react';
import './ConfirmModal.css';

export default function ConfirmModal({
  open = false,
  title = 'Confirm action',
  message = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
  showCancel = true,
  tone = 'danger',
  busy = false,
}) {
  if (!open) return null;

  const handleConfirm = () => {
    if (busy) return;
    onConfirm?.();
  };

  return (
    <div className="confirm-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className={`confirm-modal-card confirm-modal-card--${tone}`}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="confirm-modal-header">
          <h3>{title}</h3>
        </div>
        {message ? <p className="confirm-modal-message">{message}</p> : null}
        <div className="confirm-modal-actions">
          {showCancel ? (
            <button
              type="button"
              className="confirm-modal-btn confirm-modal-btn--ghost"
              onClick={onClose}
              disabled={busy}
            >
              {cancelText}
            </button>
          ) : null}
          <button
            type="button"
            className={`confirm-modal-btn confirm-modal-btn--${tone}`}
            onClick={handleConfirm}
            disabled={busy}
          >
            {busy ? 'Please wait...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
