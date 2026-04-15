import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LogIn, XCircle } from 'lucide-react';

const LoginRequiredModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleAccept = () => {
        // Find the login target. Usually we can just scroll to the login panel on landing page
        // or navigate to a dedicated login page if on a different page.
        // For now, let's navigate to root with a flag to show login if needed, 
        // or just navigate to login if it exists.
        navigate('/');
        // After small delay, scroll to login if on landing page
        setTimeout(() => {
            const loginSection = document.querySelector('.right-sidebar');
            if (loginSection) {
                loginSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
        onClose();
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.3s ease-out'
        }} onClick={onClose}>
            <div className="modal-container" style={{
                backgroundColor: 'white',
                padding: '32px',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '420px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                position: 'relative',
                textAlign: 'center',
                animation: 'slideUp 0.3s ease-out'
            }} onClick={e => e.stopPropagation()}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px auto',
                    color: '#2563eb'
                }}>
                    <LogIn size={32} />
                </div>

                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    marginBottom: '12px'
                }}>
                    {t('nocLogin.loginRequired.title')}
                </h3>
                
                <p style={{
                    color: '#475569',
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                    marginBottom: '28px'
                }}>
                    {t('nocLogin.loginRequired.message')}
                </p>

                <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'center'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '12px 20px',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: 'white',
                            color: '#64748b',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={e => e.target.style.backgroundColor = '#f8fafc'}
                        onMouseOut={e => e.target.style.backgroundColor = 'white'}
                    >
                        {t('nocLogin.loginRequired.reject')}
                    </button>
                    <button
                        onClick={handleAccept}
                        style={{
                            flex: 1,
                            padding: '12px 20px',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: '#1e3a8a',
                            color: 'white',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                        onMouseOver={e => e.target.style.backgroundColor = '#1e293b'}
                        onMouseOut={e => e.target.style.backgroundColor = '#1e3a8a'}
                    >
                        <LogIn size={18} />
                        {t('nocLogin.loginRequired.accept')}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default LoginRequiredModal;
