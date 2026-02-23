import React, { useEffect, useRef } from 'react';
import './ProcessFlow.css';

/**
 * Premium Process Flow Component
 * Displays steps in a professional vertical timeline with staggered animations
 */
const ProcessFlow = ({ steps = [], title = "Application Process" }) => {
    const timelineRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('pf-visible');
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
        );

        const items = timelineRef.current?.querySelectorAll('.pf-step');
        items?.forEach((item) => observer.observe(item));
        return () => items?.forEach((item) => observer.unobserve(item));
    }, [steps]);

    return (
        <div className="pf-wrapper">
            {title && (
                <div className="pf-section-label">
                    <span className="pf-label-line" />
                    <span className="pf-label-text">{title}</span>
                    <span className="pf-label-line" />
                </div>
            )}

            <div className="pf-timeline" ref={timelineRef}>
                {/* Central spine */}
                <div className="pf-spine" />

                {steps.map((step, index) => {
                    const isLeft = index % 2 === 0;
                    const statusClass = step.status || 'pending';

                    return (
                        <div
                            key={index}
                            className={`pf-step ${isLeft ? 'pf-left' : 'pf-right'}`}
                            style={{ animationDelay: `${index * 120}ms` }}
                        >
                            {/* Connector arm */}
                            <div className={`pf-connector ${statusClass}`} />

                            {/* Node on the spine */}
                            <div className={`pf-node ${statusClass}`}>
                                <span className="pf-node-icon">{step.icon || (index + 1)}</span>
                                {statusClass === 'active' && <span className="pf-pulse-ring" />}
                            </div>

                            {/* Content card */}
                            <div className={`pf-card ${statusClass}`}>
                                <div className="pf-card-number">
                                    <span>{String(index + 1).padStart(2, '0')}</span>
                                </div>
                                <h4 className="pf-card-title">{step.title}</h4>
                                <p className="pf-card-desc">{step.description}</p>
                                {step.duration && (
                                    <div className="pf-card-duration">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                        {step.duration}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProcessFlow;
