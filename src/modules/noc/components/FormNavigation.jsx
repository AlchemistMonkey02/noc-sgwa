import React from 'react';
import '../styles/noc-portal.css';

const FormNavigation = ({ currentStep, totalSteps, onPrevious, onNext, onSubmit, isLastStep }) => {
    return (
        <div className="bhuneer-button-group">
            {currentStep > 1 && (
                <button
                    type="button"
                    onClick={onPrevious}
                    className="bhuneer-btn-secondary"
                >
                    ← Previous
                </button>
            )}

            {!isLastStep ? (
                <button
                    type="button"
                    onClick={onNext}
                    className="bhuneer-btn-submit"
                >
                    Next →
                </button>
            ) : (
                <button
                    type="button"
                    onClick={onSubmit}
                    className="bhuneer-btn-submit"
                >
                    Submit Application
                </button>
            )}
        </div>
    );
};

export default FormNavigation;
