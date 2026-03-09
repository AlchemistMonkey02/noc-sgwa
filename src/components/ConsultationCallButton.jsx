import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

/**
 * ConsultationCallButton
 * Emits a call_invite socket event then navigates to the consultation room.
 * Room format: consultation-{sanitisedAppNumber}-{OFFICER_TYPE}
 */
const ConsultationCallButton = ({
    applicationNumber,
    officerType,
    callerType,     // "APPLICANT" | "OFFICER" — auto-detected from auth if omitted
    label,
    variant = 'primary',
    style = {},
}) => {
    const navigate = useNavigate();
    const { user, isOfficer } = useAuth();
    const notifCtx = useNotifications();

    const sanitiseRoom = (appNum) =>
        String(appNum || 'ROOM')
            .trim()
            .replace(/[/\\\s]+/g, '-')
            .replace(/[^a-zA-Z0-9\-_]/g, '')
            .toUpperCase();

    const roomId = `consultation-${sanitiseRoom(applicationNumber)}-${officerType}`;

    const handleClick = (e) => {
        e.stopPropagation();

        // isOfficer is a FUNCTION in AuthContext — must call it with ()
        const detectedCallerType = callerType || (isOfficer() ? 'OFFICER' : 'APPLICANT');
        const callerName =
            (user?.firstName && user?.lastName)
                ? `${user.firstName} ${user.lastName}`.trim()
                : user?.name || user?.username || 'User';

        // Emit invite via the unified NotificationContext socket
        notifCtx?.emitCallInvite?.(roomId, {
            callerId: user?.id,
            callerName,
            callerRole: detectedCallerType === 'OFFICER' ? officerType : 'Applicant',
            callerType: detectedCallerType,
            officerType,
            applicationNumber: applicationNumber, // Pass original for backend DB lookup
        });

        // Open the global consultation widget instead of navigating
        notifCtx?.startCall?.(roomId);
    };

    const officerLabels = {
        DGO: 'District Ground Water Officer',
        SGWA: 'SGWA Officer',
        ENFORCEMENT: 'Enforcement Officer',
        INSPECTION: 'Inspection Officer',
    };

    const displayLabel = label || `📞 Call ${officerType}`;
    const titleText = `Start video/voice call with ${officerLabels[officerType] || officerType}`;

    const base = {
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        borderRadius: '999px', border: 'none', cursor: 'pointer',
        fontWeight: '600', fontFamily: 'inherit',
        transition: 'all 0.18s ease', whiteSpace: 'nowrap', flexShrink: 0,
    };
    const variants = {
        primary: { background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', padding: '8px 18px', fontSize: '0.875rem', boxShadow: '0 2px 12px rgba(16,185,129,0.35)' },
        outline: { background: 'transparent', color: '#059669', border: '1.5px solid #059669', padding: '7px 16px', fontSize: '0.875rem' },
        mini: { background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', padding: '5px 12px', fontSize: '0.78rem', boxShadow: '0 1px 8px rgba(16,185,129,0.3)' },
    };

    return (
        <button
            style={{ ...base, ...variants[variant], ...style }}
            onClick={handleClick}
            title={titleText}
            aria-label={titleText}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
            {displayLabel}
        </button>
    );
};

export default ConsultationCallButton;
