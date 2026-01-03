import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OfficerHeader from './components/OfficerHeader';
import StatusBadge from './components/StatusBadge';
import { getApplicationById } from './utils/mockApplicationData';
import './styles/officer-portal.css';

const ApplicationReview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [officer, setOfficer] = useState(null);
    const [application, setApplication] = useState(null);
    const [reviewData, setReviewData] = useState({
        action: '',
        comments: '',
        conditions: '',
        validityPeriod: '2',
        clarifications: ''
    });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [documentChecks, setDocumentChecks] = useState({});

    useEffect(() => {
        // Check if officer is logged in
        const officerData = localStorage.getItem('nocOfficer');
        if (!officerData) {
            navigate('/noc/officer/login');
            return;
        }

        setOfficer(JSON.parse(officerData));

        // Load application data
        const app = getApplicationById(id);
        if (app) {
            setApplication(app);
            // Initialize document checks
            const checks = {};
            app.documents.forEach(doc => {
                checks[doc.name] = doc.verified || false;
            });
            setDocumentChecks(checks);
        } else {
            navigate('/noc/officer/dashboard');
        }
    }, [id, navigate]);

    const handleDocumentCheck = (docName) => {
        setDocumentChecks(prev => ({
            ...prev,
            [docName]: !prev[docName]
        }));
    };

    const handleReviewChange = (e) => {
        const { name, value } = e.target;
        setReviewData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitReview = (action) => {
        setReviewData(prev => ({ ...prev, action }));
        setShowConfirmModal(true);
    };

    const confirmSubmit = () => {
        // In a real application, this would send data to backend
        console.log('Review submitted:', {
            applicationId: id,
            officer: officer.name,
            reviewData
        });

        // Show success message and redirect
        alert(`Application ${reviewData.action === 'approve' ? 'Approved' : reviewData.action === 'reject' ? 'Rejected' : 'Clarification Requested'} successfully!`);
        navigate('/noc/officer/dashboard');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!officer || !application) {
        return null;
    }

    const allDocsVerified = Object.values(documentChecks).every(checked => checked);

    return (
        <div className="officer-portal">
            <OfficerHeader officer={officer} />

            <div className="officer-container">
                {/* Application Header */}
                <div className="officer-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                        <div>
                            <h1 style={{ margin: 0, color: 'var(--officer-primary)', fontSize: '1.8rem' }}>
                                Application Review
                            </h1>
                            <p style={{ margin: '5px 0 10px 0', color: 'var(--officer-text-secondary)', fontSize: '1rem' }}>
                                Application ID: <strong style={{ color: 'var(--officer-primary)' }}>{application.id}</strong>
                            </p>
                            <StatusBadge status={application.status} />
                        </div>
                        <button
                            onClick={() => navigate('/noc/officer/dashboard')}
                            className="officer-btn officer-btn-outline"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>

                {/* Application Details */}
                <div className="review-section">
                    <div className="review-section-header">
                        📋 Application Details
                    </div>
                    <div className="review-section-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                            <div>
                                <label style={{ fontWeight: '600', color: '#64748b', fontSize: '0.85rem' }}>Applicant Name</label>
                                <div style={{ fontSize: '1rem', marginTop: '5px' }}>{application.applicantName}</div>
                            </div>
                            <div>
                                <label style={{ fontWeight: '600', color: '#64748b', fontSize: '0.85rem' }}>Company/Organization</label>
                                <div style={{ fontSize: '1rem', marginTop: '5px' }}>{application.companyName}</div>
                            </div>
                            <div>
                                <label style={{ fontWeight: '600', color: '#64748b', fontSize: '0.85rem' }}>Email</label>
                                <div style={{ fontSize: '1rem', marginTop: '5px' }}>{application.email}</div>
                            </div>
                            <div>
                                <label style={{ fontWeight: '600', color: '#64748b', fontSize: '0.85rem' }}>Phone</label>
                                <div style={{ fontSize: '1rem', marginTop: '5px' }}>{application.phone}</div>
                            </div>
                            <div>
                                <label style={{ fontWeight: '600', color: '#64748b', fontSize: '0.85rem' }}>Category</label>
                                <div style={{ fontSize: '1rem', marginTop: '5px' }}>
                                    <span style={{ padding: '4px 12px', background: '#e0e7ff', borderRadius: '4px', fontWeight: '600', color: '#3730a3' }}>
                                        {application.category}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label style={{ fontWeight: '600', color: '#64748b', fontSize: '0.85rem' }}>Application Type</label>
                                <div style={{ fontSize: '1rem', marginTop: '5px' }}>{application.applicationType}</div>
                            </div>
                            <div>
                                <label style={{ fontWeight: '600', color: '#64748b', fontSize: '0.85rem' }}>Withdrawal Quantity</label>
                                <div style={{ fontSize: '1.2rem', marginTop: '5px', fontWeight: '700', color: 'var(--officer-primary)' }}>
                                    {application.withdrawalQuantity} KLD
                                </div>
                            </div>
                            <div>
                                <label style={{ fontWeight: '600', color: '#64748b', fontSize: '0.85rem' }}>Submitted Date</label>
                                <div style={{ fontSize: '1rem', marginTop: '5px' }}>{formatDate(application.submittedDate)}</div>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px' }}>
                            <label style={{ fontWeight: '600', color: '#64748b', fontSize: '0.85rem' }}>Project Name</label>
                            <div style={{ fontSize: '1rem', marginTop: '5px', fontWeight: '600' }}>{application.projectName}</div>
                        </div>

                        <div style={{ marginTop: '15px' }}>
                            <label style={{ fontWeight: '600', color: '#64748b', fontSize: '0.85rem' }}>Location</label>
                            <div style={{ fontSize: '1rem', marginTop: '5px' }}>{application.location}</div>
                            <div style={{ fontSize: '0.9rem', marginTop: '3px', color: '#64748b' }}>
                                {application.district}, {application.state}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Document Verification */}
                <div className="review-section">
                    <div className="review-section-header">
                        📄 Document Verification ({Object.values(documentChecks).filter(Boolean).length}/{application.documents.length} Verified)
                    </div>
                    <div className="review-section-body">
                        <ul className="document-list">
                            {application.documents.map((doc, index) => (
                                <li key={index} className="document-item">
                                    <div className="document-info">
                                        <input
                                            type="checkbox"
                                            className="document-checkbox"
                                            checked={documentChecks[doc.name] || false}
                                            onChange={() => handleDocumentCheck(doc.name)}
                                        />
                                        <span style={{ fontWeight: '500' }}>{doc.name}</span>
                                        {doc.uploaded && (
                                            <span style={{
                                                marginLeft: '10px',
                                                padding: '2px 8px',
                                                background: '#d1fae5',
                                                color: '#065f46',
                                                borderRadius: '3px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600'
                                            }}>
                                                ✓ Uploaded
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <button className="officer-btn officer-btn-outline officer-btn-sm">
                                            📥 Download
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Approval History */}
                {application.approvalHistory && application.approvalHistory.length > 0 && (
                    <div className="review-section">
                        <div className="review-section-header">
                            📜 Approval History
                        </div>
                        <div className="review-section-body">
                            <div className="timeline">
                                {application.approvalHistory.map((entry, index) => (
                                    <div key={index} className="timeline-item">
                                        <div className="timeline-marker"></div>
                                        <div className="timeline-content">
                                            <h4 className="timeline-title">{entry.action}</h4>
                                            <p className="timeline-meta">
                                                By: {entry.by} | {formatDate(entry.date)}
                                            </p>
                                            <p className="timeline-description">{entry.comments}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Review Form */}
                <div className="review-section">
                    <div className="review-section-header">
                        ✍️ Officer's Review
                    </div>
                    <div className="review-section-body">
                        <div className="officer-form-group">
                            <label className="officer-form-label">Review Comments / Remarks</label>
                            <textarea
                                name="comments"
                                className="officer-form-control"
                                rows="5"
                                placeholder="Enter your detailed review comments here..."
                                value={reviewData.comments}
                                onChange={handleReviewChange}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                            <div className="officer-form-group">
                                <label className="officer-form-label">Conditions for Approval (if any)</label>
                                <textarea
                                    name="conditions"
                                    className="officer-form-control"
                                    rows="3"
                                    placeholder="e.g., Monthly monitoring reports required"
                                    value={reviewData.conditions}
                                    onChange={handleReviewChange}
                                />
                            </div>

                            <div className="officer-form-group">
                                <label className="officer-form-label">Validity Period (in years)</label>
                                <select
                                    name="validityPeriod"
                                    className="officer-form-control"
                                    value={reviewData.validityPeriod}
                                    onChange={handleReviewChange}
                                >
                                    <option value="1">1 Year</option>
                                    <option value="2">2 Years</option>
                                    <option value="3">3 Years</option>
                                    <option value="5">5 Years</option>
                                </select>
                            </div>
                        </div>

                        <div className="officer-form-group">
                            <label className="officer-form-label">Clarifications Required (if requesting clarification)</label>
                            <textarea
                                name="clarifications"
                                className="officer-form-control"
                                rows="3"
                                placeholder="List specific documents or information needed..."
                                value={reviewData.clarifications}
                                onChange={handleReviewChange}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div style={{
                            marginTop: '30px',
                            padding: '20px',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <h3 style={{ margin: '0 0 15px 0', color: 'var(--officer-primary)' }}>
                                Review Decision
                            </h3>
                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                <button
                                    className="officer-btn officer-btn-success"
                                    onClick={() => handleSubmitReview('approve')}
                                    disabled={!allDocsVerified || !reviewData.comments}
                                >
                                    ✅ Approve Application
                                </button>
                                <button
                                    className="officer-btn officer-btn-danger"
                                    onClick={() => handleSubmitReview('reject')}
                                    disabled={!reviewData.comments}
                                >
                                    ❌ Reject Application
                                </button>
                                <button
                                    className="officer-btn officer-btn-warning"
                                    onClick={() => handleSubmitReview('clarify')}
                                    disabled={!reviewData.clarifications}
                                >
                                    📝 Request Clarification
                                </button>
                                <button
                                    className="officer-btn officer-btn-outline"
                                    onClick={() => navigate('/noc/officer/dashboard')}
                                >
                                    💾 Save as Draft
                                </button>
                            </div>
                            {!allDocsVerified && (
                                <div style={{ marginTop: '15px', color: '#f59e0b', fontSize: '0.9rem' }}>
                                    ⚠️ Please verify all documents before approving
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '10px',
                        padding: '30px',
                        maxWidth: '500px',
                        width: '90%'
                    }}>
                        <h2 style={{ margin: '0 0 15px 0', color: 'var(--officer-primary)' }}>
                            Confirm Review Submission
                        </h2>
                        <p style={{ margin: '0 0 20px 0', fontSize: '1rem', lineHeight: '1.6' }}>
                            Are you sure you want to {' '}
                            <strong>
                                {reviewData.action === 'approve' ? 'APPROVE' :
                                    reviewData.action === 'reject' ? 'REJECT' :
                                        'REQUEST CLARIFICATION FOR'}
                            </strong>
                            {' '} application <strong>{application.id}</strong>?
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                className="officer-btn officer-btn-outline"
                                onClick={() => setShowConfirmModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={`officer-btn ${reviewData.action === 'approve' ? 'officer-btn-success' :
                                        reviewData.action === 'reject' ? 'officer-btn-danger' :
                                            'officer-btn-warning'
                                    }`}
                                onClick={confirmSubmit}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicationReview;
