import React from 'react';
import '../styles/noc-portal.css';

const FormNavigation = ({ currentStep, totalSteps, onPrevious, onNext, onSubmit, isLastStep }) => {
    return (
        <div className="noc-form-navigation">
            <div>
                {currentStep > 1 && (
                    <button
                        type="button"
                        onClick={onPrevious}
                        className="noc-btn noc-btn-secondary"
                    >
                        ← Previous
                    </button>
                )}
            </div>

            <div style={{ textAlign: 'center', flex: 1 }}>
                <span style={{ color: 'var(--cgwa-text-secondary)', fontWeight: '600' }}>
                    Step {currentStep} of {totalSteps}
                </span>
            </div>

            <div>
                {isLastStep ? (
                    <button
                        type="button"
                        onClick={onSubmit}
                        className="noc-btn noc-btn-success"
                    >
                        Submit Application →
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onNext}
                        className="noc-btn noc-btn-primary"
                    >
                        Next →
                    </button>
                )}
            </div>
        </div>
    );
};

export default FormNavigation;
