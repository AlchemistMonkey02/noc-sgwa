import React, { useEffect, useState } from 'react';
import './AppLoader.css';

const AppLoader = ({ onLoadComplete }) => {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Show loader for 2.5 seconds
        const timer = setTimeout(() => {
            setFadeOut(true);
            // Call onLoadComplete after fade animation
            setTimeout(() => {
                if (onLoadComplete) {
                    onLoadComplete();
                }
            }, 500); // Match CSS transition duration
        }, 2500);

        return () => clearTimeout(timer);
    }, [onLoadComplete]);

    return (
        <div className={`app-loader ${fadeOut ? 'fade-out' : ''}`}>
            <div className="loader-content">
                <div className="loader-logo">
                    <div className="logo-icon">💧</div>
                    <h1 className="loader-title">Ground Water Department</h1>
                    <h2 className="loader-subtitle">Government of Rajasthan</h2>
                </div>

                <div className="loader-spinner">
                    <div className="spinner"></div>
                </div>

                <p className="loader-text">Initializing Portal...</p>
            </div>
        </div>
    );
};

export default AppLoader;
