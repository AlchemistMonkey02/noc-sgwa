import React from 'react';
import '../styles/officer-portal.css';

const Timeline = ({ events }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getEventIcon = (eventType) => {
        const icons = {
            'SUBMITTED': '📤',
            'PAYMENT_VERIFIED': '💳',
            'DOCUMENTS_VERIFICATION': '📄',
            'QUERY_RAISED': '❓',
            'QUERY_ANSWERED': '✅',
            'SITE_INSPECTION': '🔍',
            'INSPECTION_COMPLETED': '✓',
            'FORWARDED_TO_SGWA': '➡️',
            'TECHNICAL_REVIEW': '🔬',
            'FORWARDED_TO_ENFORCEMENT': '➡️',
            'APPROVED': '✅',
            'REJECTED': '❌',
            'NOC_ISSUED': '📜'
        };
        return icons[eventType] || '•';
    };

    const isCompleted = (eventType) => {
        const completedEvents = [
            'PAYMENT_VERIFIED',
            'DOCUMENTS_VERIFIED',
            'INSPECTION_COMPLETED',
            'APPROVED',
            'NOC_ISSUED'
        ];
        return completedEvents.includes(eventType);
    };

    return (
        <div className="officer-timeline">
            {events.map((event, index) => (
                <div key={index} className="officer-timeline-item">
                    <div className={`officer-timeline-marker ${isCompleted(event.type) ? 'success' : ''}`}>
                        {getEventIcon(event.type)}
                    </div>
                    <div className="officer-timeline-content">
                        <h4 className="officer-timeline-title">{event.title}</h4>
                        <p className="officer-timeline-meta">
                            {formatDate(event.timestamp)} • {event.actor}
                        </p>
                        {event.remarks && (
                            <p className="officer-timeline-description">{event.remarks}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Timeline;
