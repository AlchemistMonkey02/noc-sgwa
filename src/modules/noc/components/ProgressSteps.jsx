import React from 'react';
import '../styles/noc-portal.css';

const ProgressSteps = ({ steps, currentStep }) => {
    return (
        <div className="noc-progress-steps">
            {steps.map((step, index) => (
                <div
                    key={step.id}
                    className={`noc-step ${currentStep === step.id ? 'active' : ''
                        } ${currentStep > step.id ? 'completed' : ''}`}
                >
                    <div className="noc-step-number">
                        {currentStep > step.id ? '✓' : step.id}
                    </div>
                    <div className="noc-step-label">{step.title}</div>
                </div>
            ))}
        </div>
    );
};

export default ProgressSteps;
