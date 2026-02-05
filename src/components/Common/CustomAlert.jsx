import React from 'react';
import './CustomAlert.css';

/**
 * CustomAlert Component
 * @param {boolean} isOpen - Whether the alert is visible
 * @param {function} onClose - Function to close the alert
 * @param {string} title - Title of the alert
 * @param {string} message - Message body
 * @param {string} type - 'warning', 'success', 'info', 'confirm'
 * @param {function} onConfirm - Function to call when confirmed (for type='confirm')
 * @param {string} confirmLabel - Label for the confirm button
 * @param {string} cancelLabel - Label for the cancel button
 */
const CustomAlert = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'info',
    onConfirm,
    confirmLabel = 'Ya, Keluar',
    cancelLabel = 'Batal'
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'warning':
            case 'confirm':
                return (
                    <div className="custom-alert-icon warning">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    </div>
                );
            case 'success':
                return (
                    <div className="custom-alert-icon success">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="custom-alert-icon info">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                    </div>
                );
        }
    };

    return (
        <div className="custom-alert-overlay" onClick={onClose}>
            <div className="custom-alert-box" onClick={e => e.stopPropagation()}>
                {getIcon()}
                <h3 className="custom-alert-title">{title}</h3>
                <p className="custom-alert-message">{message}</p>

                <div className="custom-alert-buttons">
                    {type === 'confirm' ? (
                        <>
                            <button className="custom-alert-btn cancel" onClick={onClose}>
                                {cancelLabel}
                            </button>
                            <button className="custom-alert-btn confirm" onClick={() => {
                                onConfirm();
                                onClose();
                            }}>
                                {confirmLabel}
                            </button>
                        </>
                    ) : (
                        <button className="custom-alert-btn ok" onClick={onClose}>
                            OK
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomAlert;
