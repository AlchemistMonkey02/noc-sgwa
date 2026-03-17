/**
 * NotificationBell — In-App Notification Panel
 * ─────────────────────────────────────────────
 * A bell icon that shows an unread badge and opens a dropdown panel
 * listing all in-app notifications. Works in both officer and applicant portals.
 *
 * Props:
 *   theme  "dark" | "light"  — dark for officer header, light for public header
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

const NotificationBell = ({ theme = 'light' }) => {
    const navigate = useNavigate();
    const {
        notifications, unreadCount, markRead, markAllRead, clearAll, TYPE_META,
        startCall,
    } = useNotifications() || {};
    const [open, setOpen] = useState(false);
    const panelRef = useRef(null);

    // Close panel on outside click
    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    if (!useNotifications()) return null; // No context (not logged in)

    const isDark = theme === 'dark';

    const handleNotifClick = (notif) => {
        markRead?.(notif.id);
        if (notif.type === 'call_invite' && notif.payload?.room) {
            startCall?.(notif.payload.room);
            setOpen(false);
        }
    };

    const formatTime = (ts) => {
        const d = ts instanceof Date ? ts : new Date(ts);
        const diff = Math.floor((Date.now() - d) / 1000);
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return d.toLocaleDateString();
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }} ref={panelRef}>
            {/* ── Bell Button ───────────────────────────────────── */}
            <button
                onClick={() => { setOpen(o => !o); if (!open) { } }}
                style={{
                    position: 'relative',
                    background: isDark ? 'rgba(255,255,255,0.12)' : 'var(--gray-50)',
                    border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--gray-200)',
                    borderRadius: '12px',
                    padding: '8px 10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.18s',
                    flexShrink: 0,
                }}
                title="Notifications"
                aria-label="Notifications"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke={isDark ? '#fff' : '#334155'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '-5px', right: '-5px',
                        background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                        color: '#fff', borderRadius: '10px',
                        minWidth: '18px', height: '18px',
                        fontSize: '0.68rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 4px',
                        boxShadow: '0 2px 6px rgba(239,68,68,0.5)',
                        border: isDark ? '2px solid #1e3a5f' : '2px solid #fff',
                        lineHeight: 1,
                        animation: unreadCount > 0 ? '_nb_pop 0.3s cubic-bezier(.34,1.56,.64,1)' : 'none',
                    }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* ── Dropdown Panel ────────────────────────────────── */}
            {open && (
                <>
                    <style>{`
                        @keyframes _nb_pop  { from{transform:scale(0.5);opacity:0} to{transform:scale(1);opacity:1} }
                        @keyframes _nb_drop { from{transform:translateY(-8px) scaleY(0.95);opacity:0} to{transform:translateY(0) scaleY(1);opacity:1} }
                        ._nb_panel { animation: _nb_drop .2s ease forwards; transform-origin: top right; }
                        ._nb_item:hover { background: rgba(99,102,241,0.08) !important; }
                    `}</style>
                    <div className="_nb_panel" style={{
                        position: 'absolute',
                        top: 'calc(100% + 10px)',
                        right: 0,
                        width: '360px',
                        background: '#fff',
                        border: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: '16px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
                        zIndex: 9000,
                        overflow: 'hidden',
                        fontFamily: "'Inter', system-ui, sans-serif",
                    }}>
                        {/* Header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '16px 18px 12px',
                            borderBottom: '1px solid rgba(0,0,0,0.06)',
                            background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '8px',
                                    background: 'rgba(255,255,255,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                        stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                    </svg>
                                </div>
                                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9' }}>
                                    Notifications
                                </span>
                                {unreadCount > 0 && (
                                    <span style={{
                                        background: '#ef4444', color: '#fff',
                                        borderRadius: '10px', padding: '2px 8px',
                                        fontSize: '0.72rem', fontWeight: 700,
                                    }}>
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                {unreadCount > 0 && (
                                    <button onClick={markAllRead} style={btnStyle('#60a5fa')}>Mark all read</button>
                                )}
                                <button onClick={clearAll} style={btnStyle('rgba(255,255,255,0.35)')}>Clear all</button>
                            </div>
                        </div>

                        {/* List */}
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {notifications?.length === 0 ? (
                                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🔔</div>
                                    <p style={{ margin: 0, fontSize: '0.88rem' }}>No notifications yet</p>
                                </div>
                            ) : (
                                notifications?.map(notif => {
                                    const meta = TYPE_META?.[notif.type] || TYPE_META?.general;
                                    const isCall = notif.type === 'call_invite';
                                    return (
                                        <div
                                            key={notif.id}
                                            className="_nb_item"
                                            onClick={() => handleNotifClick(notif)}
                                            style={{
                                                display: 'flex', gap: '12px',
                                                padding: '13px 18px',
                                                borderBottom: '1px solid rgba(0,0,0,0.04)',
                                                cursor: isCall ? 'pointer' : 'default',
                                                background: notif.read ? 'transparent' : 'rgba(99,102,241,0.04)',
                                                transition: 'background 0.15s',
                                                alignItems: 'flex-start',
                                            }}
                                        >
                                            {/* Icon pill */}
                                            <div style={{
                                                flexShrink: 0,
                                                width: 38, height: 38, borderRadius: '10px',
                                                background: meta.color + '18',
                                                border: `1px solid ${meta.color}30`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.1rem',
                                            }}>
                                                {meta.icon}
                                            </div>

                                            {/* Content */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.3 }}>
                                                        {notif.title}
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', flexShrink: 0 }}>
                                                        {formatTime(notif.timestamp)}
                                                    </span>
                                                </div>
                                                <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {notif.body}
                                                </p>
                                                {/* Call join button inline */}
                                                {isCall && notif.payload?.room && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleNotifClick(notif); }}
                                                        style={{
                                                            marginTop: '6px', padding: '4px 12px',
                                                            background: 'linear-gradient(135deg,#059669,#10b981)',
                                                            color: '#fff', border: 'none', borderRadius: '6px',
                                                            fontSize: '0.75rem', fontWeight: 700,
                                                            cursor: 'pointer', fontFamily: 'inherit',
                                                        }}
                                                    >
                                                        📞 Join Call
                                                    </button>
                                                )}
                                            </div>

                                            {/* Unread dot */}
                                            {!notif.read && (
                                                <div style={{
                                                    flexShrink: 0, alignSelf: 'center',
                                                    width: 8, height: 8, borderRadius: '50%',
                                                    background: meta.color,
                                                    boxShadow: `0 0 5px ${meta.color}`,
                                                }} />
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        {notifications?.length > 0 && (
                            <div style={{
                                padding: '10px 18px',
                                borderTop: '1px solid rgba(0,0,0,0.06)',
                                background: '#f8fafc',
                                textAlign: 'center',
                            }}>
                                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                    {notifications.length} total notification{notifications.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

// ── helper for header action buttons ─────────────────────────────────────────
const btnStyle = (color) => ({
    background: 'transparent',
    border: `1px solid ${color}`,
    borderRadius: '6px',
    padding: '3px 8px',
    color: color,
    fontSize: '0.7rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
});

export default NotificationBell;
