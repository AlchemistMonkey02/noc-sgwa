import React from 'react';
import '../styles/noc-portal.css';

const FormNavigation = ({ currentStep, totalSteps, onPrevious, onNext, onSubmit, isLastStep }) => {
    return (
        <div className="nd-nav-footer">
            {currentStep > 1 ? (
                <button
                    type="button"
                    onClick={onPrevious}
                    className="nd-btn-prev"
                >
                    <span style={{ fontSize: '1.2rem' }}>←</span>
                    <span className="nd-nav-btn-text">Previous Step</span>
                </button>
            ) : <div />}

            {!isLastStep ? (
                <button
                    type="button"
                    onClick={onNext}
                    className="nd-btn-next"
                >
                    <span className="nd-nav-btn-text">Save & Continue</span>
                    <span style={{ fontSize: '1.2rem' }}>→</span>
                </button>
            ) : (
                <button
                    type="button"
                    onClick={onSubmit}
                    className="nd-btn-next"
                    style={{ background: '#10b981', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)' }}
                >
                    <span className="nd-nav-btn-text">Submit Application</span>
                    <span style={{ fontSize: '1.2rem' }}>🚀</span>
                </button>
            )}
        </div>
    );
};

export default FormNavigation;
