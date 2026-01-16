import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CommonPlaceholder from './components/CommonPlaceholder';

const AccountSettings = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const currentTab = searchParams.get('tab') || 'password';

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const tabs = [
        { id: 'password', label: 'Change Password' },
        { id: 'security', label: 'Security Settings' }
    ];

    const handleTabChange = (tabId) => {
        setSearchParams({ tab: tabId });
        setMessage({ type: '', text: '' }); // Clear messages on tab switch
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error message when user starts typing
        if (message.type === 'error') {
            setMessage({ type: '', text: '' });
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setMessage({ type: 'error', text: 'Authentication token not found. Please login again.' });
                setLoading(false);
                return;
            }

            const response = await fetch('http://localhost:3000/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Password updated successfully!' });
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to update password' });
            }
        } catch (error) {
            console.error('Password change error:', error);
            setMessage({ type: 'error', text: 'An error occurred while connecting to the server' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <CommonPlaceholder
            title="Account Settings"
            subtitle="Manage your password and security preferences"
            breadcrumb="Account Settings"
            tabs={tabs}
            activeTab={currentTab}
            onTabChange={handleTabChange}
        >
            <div style={{ padding: '0 2rem' }}>
                {currentTab === 'password' && (
                    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <div className="card-header">
                            <h2 className="card-title">Change Password</h2>
                        </div>
                        <div className="card-body">
                            {message.text && (
                                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-4`}>
                                    <div className="alert-content">
                                        <div className="alert-message">{message.text}</div>
                                    </div>
                                </div>
                            )}
                            <form onSubmit={handlePasswordSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Current Password <span className="text-error">*</span></label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        className="form-control"
                                        placeholder="Enter current password"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        autoComplete="current-password"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">New Password <span className="text-error">*</span></label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        className="form-control"
                                        placeholder="Enter new password"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        autoComplete="new-password"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Confirm New Password <span className="text-error">*</span></label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        className="form-control"
                                        placeholder="Confirm new password"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        autoComplete="new-password"
                                    />
                                </div>
                                <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {currentTab === 'security' && (
                    <div className="dashboard-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div className="card-title-bar">
                            <h2 className="card-main-title">Security Preferences</h2>
                        </div>
                        <div className="card-content-area">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>Two-Factor Authentication (2FA)</h4>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Add an extra layer of security to your account.</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="slider round"></span>
                                    </label>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>Login Notifications</h4>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Receive email alerts for new logins.</p>
                                    </div>
                                    <label className="toggle-switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="slider round"></span>
                                    </label>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>Session Timeout</h4>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Auto-logout after inactivity.</p>
                                    </div>
                                    <select className="bhuneer-input" style={{ width: '150px' }} defaultValue="30">
                                        <option value="15">15 Minutes</option>
                                        <option value="30">30 Minutes</option>
                                        <option value="60">1 Hour</option>
                                    </select>
                                </div>
                                <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                                    <button type="button" className="bhuneer-submit-btn">Save Changes</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CommonPlaceholder>
    );
};

export default AccountSettings;
