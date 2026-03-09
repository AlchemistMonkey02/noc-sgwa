import React from 'react';
import './ProcessFlow.css';

/**
 * Professional Process Flow Component
 * Shows a visual step-by-step process in S-curve zigzag pattern
 */
const ProcessFlow = ({ steps = [], title = "Application Process" }) => {
    return (
        <div className="process-flow-container">
            {title && <h2 className="process-flow-title">{title}</h2>}

            <div className="process-flow-s-curve">
                {steps.map((step, index) => (
                    <div key={index} className="process-flow-step">
                        {/* Circle Indicator */}
                        <div className={`step-circle ${step.status || ''}`}>
                            {step.icon || (index + 1)}
                        </div>

                        {/* Content Card */}
                        <div className="step-content-box">
                            <h4 className="step-title">{step.title}</h4>
                            <p className="step-description">{step.description}</p>
                            {step.duration && (
                                <span className="step-duration">Duration: {step.duration}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProcessFlow;
