import React from 'react';
import { EXTERNAL_URLS } from '../config/constants';
import './HomePage.css';

const HomePage = () => {
    const handleLogin = () => {
        window.location.href = EXTERNAL_URLS.LOGIN_URL;
    };

    const handleRegister = () => {
        window.location.href = EXTERNAL_URLS.REGISTER_URL;
    };

    return (
        <div className="home-page">
            <div className="home-container">
                <div className="home-header">
                    <h1>State Groundwater Authority</h1>
                    <p className="subtitle">NOC Application Portal</p>
                </div>

                <div className="home-content">
                    <p className="welcome-text">
                        Welcome to the State Groundwater Authority NOC Application Portal.
                        Please login or register to proceed.
                    </p>

                    <div className="button-group">
                        <button className="btn btn-login" onClick={handleLogin}>
                            <span className="btn-icon">🔐</span>
                            Login
                        </button>
                        <button className="btn btn-register" onClick={handleRegister}>
                            <span className="btn-icon">📝</span>
                            Register
                        </button>
                    </div>
                </div>

                <div className="home-footer">
                    <p>For assistance, please contact the State Groundwater Authority</p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
