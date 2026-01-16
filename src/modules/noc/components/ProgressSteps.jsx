import React from 'react';
import '../styles/noc-portal.css';

const ProgressSteps = ({ steps, currentStep, onStepClick }) => {
    return (
        <div className="form-stepper">
            {steps.map((step, index) => (
                <div
                    key={step.id}
                    className={`step-item ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
                    onClick={() => onStepClick && onStepClick(step.id)}
                    style={{ cursor: onStepClick ? 'pointer' : 'default' }}
                    title={`Click to go to: ${step.title}`}
                >
                    <div className="step-circle">
                        {currentStep > step.id ? '✓' : step.id}
                    </div>
                    <div className="step-label">{step.title}</div>
                </div>
            ))}
        </div>
    );
};

export default ProgressSteps;
