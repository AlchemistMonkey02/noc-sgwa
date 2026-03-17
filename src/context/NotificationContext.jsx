/**
 * NotificationContext — Unified In-App Notification System
 * ─────────────────────────────────────────────────────────
 * Single socket connection for ALL notification types:
 *   • Incoming call invites (call_invite)
 *   • Application status updates
 *   • Query raised / response
 *
 * Exposes:
 *   useNotifications()  → { notifications, unreadCount, markRead, clearAll, emitCallInvite }
 */
import React, {
    createContext, useContext, useEffect, useRef,
    useState, useCallback, useMemo,
} from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { API_BASE_URL, SOCKET_URL } from '../config/apiConfig';
import { useAuth } from './AuthContext';

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_NOTIFICATIONS = 50;

const NOTIF_TYPES = {
    CALL_INVITE: 'call_invite',
    APP_STATUS: 'app_status',
    QUERY: 'query',
    RECOMMENDATION: 'recommendation',
    GENERAL: 'general',
};

const TYPE_META = {
    call_invite: { icon: '📞', color: '#10b981', label: 'Incoming Call' },
    app_status: { icon: '📋', color: '#3b82f6', label: 'Application Update' },
    query: { icon: '❓', color: '#f59e0b', label: 'Query' },
    recommendation: { icon: '✅', color: '#6366f1', label: 'Recommendation' },
    general: { icon: '🔔', color: '#64748b', label: 'Notice' },
};

// ─── Context ──────────────────────────────────────────────────────────────────
const NotificationContext = createContext(null);
export const useNotifications = () => useContext(NotificationContext);

// ─── Helper ───────────────────────────────────────────────────────────────────
let _idCounter = 0;
const makeId = () => `notif-${Date.now()}-${++_idCounter}`;

// ─── Provider ────────────────────────────────────────────────────────────────
export const NotificationProvider = ({ children }) => {
    const navigate = useNavigate();
    const { user, isOfficer } = useAuth();

    const socketRef = useRef(null);
    const [notifications, setNotifications] = useState([]);
    const [socketReady, setSocketReady] = useState(false); // becomes true once the socket connects
    const [callAlert, setCallAlert] = useState(null);   // urgent popup for incoming calls
    // ── Always start with no active call — never restore from localStorage
    // Restoring a stale session causes both parties to re-subscribe on reload,
    // making the room appear full before anyone actually joins.
    const [activeCall, setActiveCall] = useState({ roomID: null, isOpen: false, isMinimized: false });
    // Ref so socket event handlers (stale closures) always read the latest value
    const activeCallRef = useRef(activeCall);

    // Keep activeCallRef in sync so stale socket closures always read current value
    useEffect(() => { activeCallRef.current = activeCall; }, [activeCall]);

    // Always clean up any leftover call session from previous page loads
    useEffect(() => { localStorage.removeItem('activeCallSession'); }, []);

    // ── Add a notification ──────────────────────────────────────────────────
    const addNotification = useCallback((type, title, body, payload = {}) => {
        const notif = {
            id: makeId(),
            type,
            title,
            body,
            payload,
            timestamp: new Date(),
            read: false,
        };
        setNotifications(prev => [notif, ...prev].slice(0, MAX_NOTIFICATIONS));
        return notif;
    }, []);

    // ── Socket setup (once user is authenticated) ───────────────────────────
    useEffect(() => {
        if (!user) return;

        // Backend registers WebRTC socket on the /stream namespace:
        //   io.of('/stream').on('connection', webrtcStream)
        // Must connect to <host>/stream — NOT the root with a custom path.
        const socketBase = SOCKET_URL;
        const sock = io(`${socketBase}/stream`, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1500,
        });
        socketRef.current = sock;

        sock.on('connect', () => {
            console.log('[NotificationContext] Socket connected to /stream namespace');
            // Register immediately so other users can route call invites to this socket by user.id
            sock.emit('register', {
                userId: user.id || user._id,
                userType: typeof isOfficer === 'function' && isOfficer() ? 'OFFICER' : 'APPLICANT'
            });
            setSocketReady(true);
        });
        sock.on('disconnect', () => {
            setSocketReady(false);
        });
        // If already connected on mount (reconnect scenario)
        if (sock.connected) {
            sock.emit('register', {
                userId: user.id || user._id,
                userType: typeof isOfficer === 'function' && isOfficer() ? 'OFFICER' : 'APPLICANT'
            });
            setSocketReady(true);
        }
        sock.on('connect_error', (err) => {
            console.warn('[NotificationContext] Socket connect error:', err.message);
        });
        // ── Incoming call invite (our new event) ───────────────────────────
        sock.on('call_invite', (data) => {
            console.log('[NotificationContext] RECV call_invite:', data);

            // REDUNDANCY FIX:
            // 1. Don't notify if I am the one who started the call
            if (data.callerId === user?.id || data.callerId === user?._id) return;

            // 2. Don't notify if I am already in THIS specific call (use ref to avoid stale closure)
            if (activeCallRef.current?.isOpen && activeCallRef.current?.roomID === data.room) return;

            // 3. Prevent cross-role notification bleeding (e.g. Applicant ringing other Applicants)
            if (data.callerType === 'APPLICANT' && typeof isOfficer === 'function' && !isOfficer()) return;

            // 4. Ensure I am the intended recipient if recipientId is specified (Fallback for broadcast)
            if (data.recipientId) {
                const myId = user?.id || user?._id;
                if (String(data.recipientId) !== String(myId)) {
                    console.log(`[NotificationContext] Ignored call_invite, recipientId mismatch. Mine: ${myId}, Target: ${data.recipientId}`);
                    return;
                }
            }

            const notif = addNotification(
                NOTIF_TYPES.CALL_INVITE,
                'Incoming Call',
                `${data.callerName || 'Someone'} is calling you` +
                (data.applicationNumber ? ` — App ${data.applicationNumber}` : ''),
                data,
            );
            setCallAlert({ ...data, notifId: notif.id });
            // Auto-dismiss after 60 s
            setTimeout(() => setCallAlert(prev => prev?.notifId === notif.id ? null : prev), 60000);
        });

        // ── Legacy incoming_consultation removed to prevent popup duplication ─
        // sock.on('incoming_consultation', ...)

        // ── Application status change ──────────────────────────────────────
        sock.on('app_status_update', (data) => {
            addNotification(
                NOTIF_TYPES.APP_STATUS,
                'Application Status Updated',
                `Application ${data.applicationNumber || ''} is now ${data.status || 'updated'}.`,
                data,
            );
        });

        // ── Query raised / response ────────────────────────────────────────
        sock.on('query_raised', (data) => {
            addNotification(
                NOTIF_TYPES.QUERY,
                'Query Raised',
                `A query has been raised on Application ${data.applicationNumber || ''}.`,
                data,
            );
        });

        sock.on('query_response', (data) => {
            addNotification(
                NOTIF_TYPES.QUERY,
                'Query Response Received',
                `Applicant responded to a query on ${data.applicationNumber || ''}.`,
                data,
            );
        });

        // ── Officer recommendation ─────────────────────────────────────────
        sock.on('officer_recommendation', (data) => {
            addNotification(
                NOTIF_TYPES.RECOMMENDATION,
                'New Recommendation',
                `${data.officerRole || 'An officer'} has submitted a recommendation on ${data.applicationNumber || ''}.`,
                data,
            );
        });

        // ── Call declined ──────────────────────────────────────────────────
        sock.on('call_invite_declined', (data) => {
            addNotification(
                NOTIF_TYPES.GENERAL,
                'Call Declined',
                `${data.declinedBy || 'User'} declined your call.`,
                data,
            );
        });

        return () => { sock.disconnect(); socketRef.current = null; };
    }, [user, addNotification]);

    // ── Emit call invite ────────────────────────────────────────────────────
    const emitCallInvite = useCallback((roomId, payload) => {
        socketRef.current?.emit('call_invite', { room: roomId, ...payload });
    }, []);

    // ── Read management ─────────────────────────────────────────────────────
    const markRead = useCallback((id) =>
        setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n)), []);
    const markAllRead = useCallback(() =>
        setNotifications(p => p.map(n => ({ ...n, read: true }))), []);
    const clearAll = useCallback(() => setNotifications([]), []);
    const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

    // ── Call Session Management ─────────────────────────────────────────────
    const startCall = useCallback((roomID) => {
        setActiveCall({ roomID, isOpen: true, isMinimized: false });
    }, []);

    const closeCall = useCallback(() => {
        setActiveCall({ roomID: null, isOpen: false, isMinimized: false });
    }, []);

    const setCallMinimized = useCallback((isMinimized) => {
        setActiveCall(prev => ({ ...prev, isMinimized }));
    }, []);

    const acceptCall = (data) => {
        setCallAlert(null);
        markRead(data.notifId);
        startCall(data.room);
    };

    const dismissCallAlert = (data) => {
        setCallAlert(null);
        socketRef.current?.emit('call_invite_declined', {
            room: data.room,
            declinedBy: user?.name || user?.username || 'User',
        });
    };

    return (
        <NotificationContext.Provider value={{
            notifications, unreadCount,
            markRead, markAllRead, clearAll,
            emitCallInvite, NOTIF_TYPES, TYPE_META,
            activeCall, startCall, closeCall, setCallMinimized,
            notifSocket: socketRef,   // expose raw socket ref for NativeConsultation to reuse
            socketReady,              // boolean — true once socket is connected
        }}>
            {children}

            {/* ── Global Incoming Call Alert ─────────────────────────── */}
            {callAlert && (
                <CallAlertModal
                    data={callAlert}
                    onAccept={() => acceptCall(callAlert)}
                    onDecline={() => dismissCallAlert(callAlert)}
                />
            )}
        </NotificationContext.Provider>
    );
};

// ─── Call Alert Modal ─────────────────────────────────────────────────────────
const CallAlertModal = ({ data, onAccept, onDecline }) => {
    const { callerName, callerRole, callerType, officerType, applicationNumber } = data;
    const isOfficer = callerType === 'OFFICER';

    return (
        <>
            <style>{`
                @keyframes _nc_ring { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.18);opacity:.55} }
                @keyframes _nc_slide { from{transform:translateY(110px);opacity:0} to{transform:translateY(0);opacity:1} }
                ._nc_ring_el { animation: _nc_ring 1.1s ease-in-out infinite; }
                ._nc_slide_el { animation: _nc_slide .4s cubic-bezier(.34,1.56,.64,1) forwards; }
            `}</style>
            <div style={S.backdrop} onClick={onDecline} />
            <div className="_nc_slide_el" style={S.modal}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <div className="_nc_ring_el" style={S.ring}>
                        <span style={{ fontSize: '2rem' }}>{isOfficer ? '👮' : '👤'}</span>
                    </div>
                </div>
                <h2 style={S.title}>Incoming Call</h2>
                <p style={S.caller}>{callerName || 'Unknown'}</p>
                <p style={S.sub}>
                    {isOfficer
                        ? `${officerType || 'Officer'} is calling you`
                        : 'Applicant is requesting a consultation'}
                </p>
                {applicationNumber && (
                    <div style={S.badge}>📋 App: {applicationNumber}</div>
                )}
                <div style={S.actions}>
                    <button style={S.declineBtn} onClick={onDecline}>📵 Decline</button>
                    <button style={S.acceptBtn} onClick={onAccept}>📞 Join Call</button>
                </div>
            </div>
        </>
    );
};

// ─── Styles for the alert modal ───────────────────────────────────────────────
const S = {
    backdrop: {
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(5px)', zIndex: 9998,
    },
    modal: {
        position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999,
        background: 'linear-gradient(160deg,#0d1b2e 0%,#111827 100%)',
        border: '1px solid rgba(99,102,241,0.35)',
        borderRadius: '20px', padding: '26px 28px',
        minWidth: '300px', maxWidth: '340px', textAlign: 'center',
        boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        fontFamily: "'Inter',system-ui,sans-serif", color: '#fff',
    },
    ring: {
        width: 72, height: 72, borderRadius: '50%',
        background: 'rgba(99,102,241,0.18)',
        border: '3px solid rgba(99,102,241,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    title: { margin: '0 0 4px', fontSize: '1.2rem', fontWeight: 700, color: '#fff' },
    caller: { margin: '0 0 4px', fontSize: '1rem', color: '#93c5fd', fontWeight: 600 },
    sub: { margin: '0 0 10px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' },
    badge: {
        display: 'inline-block', background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '8px', padding: '4px 12px',
        fontSize: '0.76rem', color: 'rgba(255,255,255,0.6)',
    },
    actions: { display: 'flex', gap: '0.75rem', marginTop: '1.25rem' },
    acceptBtn: {
        flex: 1, padding: '10px 0', borderRadius: '12px', border: 'none',
        background: 'linear-gradient(135deg,#059669,#10b981)',
        color: '#fff', fontWeight: 700, fontSize: '0.9rem',
        cursor: 'pointer', fontFamily: 'inherit',
        boxShadow: '0 4px 14px rgba(16,185,129,0.4)',
    },
    declineBtn: {
        flex: 1, padding: '10px 0', borderRadius: '12px',
        border: '1px solid rgba(239,68,68,0.4)',
        background: 'rgba(239,68,68,0.1)',
        color: '#f87171', fontWeight: 700, fontSize: '0.9rem',
        cursor: 'pointer', fontFamily: 'inherit',
    },
};
