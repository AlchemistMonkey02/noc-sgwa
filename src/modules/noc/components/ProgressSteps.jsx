import React from 'react';

const ProgressSteps = ({ steps, currentStep, onStepClick }) => {
    const isCompleted = (stepId) => currentStep > stepId;
    const isActive = (stepId) => currentStep === stepId;

    return (
        <div className="nd-stepper-container">
            {steps.map((step, index) => {
                const completed = isCompleted(step.id);
                const active = isActive(step.id);
                const isLast = index === steps.length - 1;

                return (
                    <div
                        key={step.id}
                        onClick={() => onStepClick && onStepClick(step.id)}
                        className={`nd-step-item ${active ? 'active' : ''} ${completed ? 'completed' : ''}`}
                        title={`Step ${step.id}: ${step.title}`}
                    >
                        {!isLast && (
                            <div className={`nd-step-line ${completed ? 'completed' : ''}`} />
                        )}

                        <div className="nd-step-circle">
                            {completed ? '✓' : step.id}
                        </div>

                        <div className="nd-step-label">
                            {step.title}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ProgressSteps;
