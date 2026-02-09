import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BackButton.css';

const BackButton = ({ label = 'Back', className = '', style = {} }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <button
            className={`back-button ${className}`}
            onClick={handleBack}
            style={style}
            aria-label="Go back to previous page"
        >
            <span className="back-arrow">←</span>
            <span className="back-text">{label}</span>
        </button>
    );
};

export default BackButton;
