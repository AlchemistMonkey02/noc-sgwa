import React, { useEffect, useState } from 'react';

const Toast = ({ message, type, duration, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (duration !== Infinity) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration - 300); // Start fade out slightly before removal
            return () => clearTimeout(timer);
        }
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 300); // Wait for animation
    };

    const getIcon = () => {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '🔔';
        }
    };

    return (
        <div className={`toast-item toast-${type} ${isExiting ? 'toast-exit' : 'toast-enter'}`}>
            <div className="toast-icon">{getIcon()}</div>
            <div className="toast-content">
                <p className="toast-message">{message}</p>
            </div>
            <button className="toast-close" onClick={handleClose}>&times;</button>
            {duration !== Infinity && (
                <div
                    className="toast-progress"
                    style={{ animationDuration: `${duration}ms` }}
                />
            )}
        </div>
    );
};

export default Toast;
