import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import ProgressSteps from './components/ProgressSteps';
import LegalDisclaimer from '../../components/LegalDisclaimer';
import './styles/noc-portal.css';
import {
    initialRigOperationData,
    rigOperationSteps,
    applicantTypes,
    idProofTypes,
    authorizationTypes,
    relationshipTypes,
    operationDurations,
    operationPurposesList,
    MOCK_REGISTRY_DB,
    validateOperationStep
} from './utils/rigOperationFormData';
import { states } from './utils/formData';
import { getDistricts } from './utils/blockClassification';

const RigOperationApplication = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(initialRigOperationData);
    const [errors, setErrors] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [rigSearchError, setRigSearchError] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentStep]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const handleMultiSelect = (e, field) => {
        const { value, checked } = e.target;
        let list = [...(formData[field] || [])];
        if (checked) {
            list.push(value);
        } else {
            list = list.filter(item => item !== value);
        }
        setFormData({ ...formData, [field]: list });
    };

    const handleRigSearch = () => {
        setRigSearchError('');
        const rig = MOCK_REGISTRY_DB.find(r => r.regNo.toLowerCase() === searchQuery.toLowerCase());

        if (rig) {
            if (rig.status === 'Active') {
                setFormData({
                    ...formData,
                    linkedRigRegistrationNo: rig.regNo,
                    linkedRigType: rig.type,
                    linkedRigCapacity: rig.capacity,
                    linkedRigOwner: rig.owner,
                    linkedRigValidity: rig.validity,
                    isRigActive: true
                });
            } else {
                setRigSearchError('Rig found but is ' + rig.status + '. Cannot apply for operation.');
                setFormData({ ...formData, isRigActive: false });
            }
        } else {
            setRigSearchError('Rig Registration Number not found in Registry.');
            setFormData({ ...formData, isRigActive: false });
        }
    };

    const handleNext = () => {
        const newErrors = validateOperationStep(currentStep, formData);
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setCurrentStep(currentStep + 1);
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = () => {
        const newErrors = validateOperationStep(currentStep, formData);
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        // Redirect to Success or Dashboard
        alert('Rig Operation Application Submitted Successfully!');
        navigate('/noc/dashboard');
    };

    // Helper to get today's date
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="noc-portal">
            <NOCHeader />
            <div className="noc-container" style={{ padding: '30px 15px' }}>
                <div className="noc-application-wrapper">
                    <div className="noc-form-header">
                        <h2>Rig Operation Permission (NOC)</h2>
                        <p>Application for permission to operate a registered drilling rig in specific areas</p>
                    </div>

                    <ProgressSteps steps={rigOperationSteps} currentStep={currentStep} />

                    <div className="noc-form-content">

                        {/* STEP 1: Applicant Identity Details */}
                        {currentStep === 1 && (
                            <div>
                                <h3 className="noc-section-title">Section A: Applicant Identity Details</h3>
                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Applicant Type</label>
                                        <select name="applicantType" value={formData.applicantType} onChange={handleChange} className="noc-form-control">
                                            <option value="">Select Type</option>
                                            {applicantTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Applicant Full Name</label>
                                        <input type="text" name="applicantName" value={formData.applicantName} onChange={handleChange} className="noc-form-control" placeholder="As per ID proof" />
                                        {errors.applicantName && <p className="noc-form-error">{errors.applicantName}</p>}
                                    </div>
                                </div>
                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Father's / Authorized Signatory Name</label>
                                        <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className="noc-form-control" />
                                    </div>
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Mobile Number <span style={{ fontSize: '0.8rem', color: '#666' }}>(OTP verified)</span></label>
                                        <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className="noc-form-control" maxLength="10" />
                                        {errors.mobileNumber && <p className="noc-form-error">{errors.mobileNumber}</p>}
                                    </div>
                                </div>
                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label">Email ID <span style={{ fontSize: '0.8rem', color: '#666' }}>(OTP verified)</span></label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="noc-form-control" />
                                    </div>
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Identity Proof Type</label>
                                        <select name="idProofType" value={formData.idProofType} onChange={handleChange} className="noc-form-control">
                                            <option value="">Select ID Type</option>
                                            {idProofTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Identity Proof Number</label>
                                    <input type="text" name="idProofNumber" value={formData.idProofNumber} onChange={handleChange} className="noc-form-control" placeholder="Enter Aadhaar / PAN / GST / Govt ID Number" />
                                </div>
                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Full Address</label>
                                    <textarea name="address" value={formData.address} onChange={handleChange} className="noc-form-control" rows="2" />
                                </div>
                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">State</label>
                                        <select name="state" value={formData.state} onChange={handleChange} className="noc-form-control">
                                            {states.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">District</label>
                                        <select name="district" value={formData.district} onChange={handleChange} className="noc-form-control">
                                            <option value="">Select District</option>
                                            {formData.state && getDistricts(formData.state).map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Identity Proof Document Upload</label>
                                    <input type="file" accept=".pdf,.jpg,.jpeg" className="noc-form-control" />
                                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>Upload PDF or JPG (Max 2MB)</p>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Rig Identification (Fetch) */}
                        {currentStep === 2 && (
                            <div>
                                <h3 className="noc-section-title">Section B: Rig Identification</h3>
                                <div className="noc-card" style={{ padding: '20px', border: '1px solid #dee2e6' }}>
                                    <label className="noc-form-label required">Search Registered Rig</label>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                        <input
                                            type="text"
                                            className="noc-form-control"
                                            placeholder="Enter Rig Registration Number (e.g. RG-RAJ-2024-001)"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <button className="noc-btn noc-btn-primary" onClick={handleRigSearch}>
                                            Fetch Details
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: '#666' }}>Tip: Try "RG-RAJ-2024-001"</p>
                                    {rigSearchError && <div className="noc-alert noc-alert-danger">{rigSearchError}</div>}
                                </div>

                                {formData.linkedRigRegistrationNo && (
                                    <div className="noc-card" style={{ marginTop: '20px', background: '#e3f2fd', border: '1px solid #90caf9', padding: '15px' }}>
                                        <h4>Fetched Rig Details</h4>
                                        <div className="noc-form-row two-col">
                                            <div><strong>Reg No:</strong> {formData.linkedRigRegistrationNo}</div>
                                            <div><strong>Type:</strong> {formData.linkedRigType}</div>
                                            <div><strong>Capacity:</strong> {formData.linkedRigCapacity}</div>
                                            <div><strong>Owner:</strong> {formData.linkedRigOwner}</div>
                                            <div><strong>Valid Upto:</strong> {formData.linkedRigValidity}</div>
                                            <div><strong>Status:</strong> <span style={{ color: 'green', fontWeight: 'bold' }}>Active</span></div>
                                        </div>
                                    </div>
                                )}
                                {errors.linkedRigRegistrationNo && <p className="noc-form-error">{errors.linkedRigRegistrationNo}</p>}
                            </div>
                        )}

                        {/* STEP 3: Relationship with Rig Owner */}
                        {currentStep === 3 && (
                            <div>
                                <h3 className="noc-section-title">Section C: Relationship with Rig Owner</h3>
                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Are you the Rig Owner?</label>
                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        <label style={{ cursor: 'pointer' }}>
                                            <input type="radio" name="isApplicantRigOwner" value="Yes" checked={formData.isApplicantRigOwner === 'Yes'} onChange={handleChange} /> Yes
                                        </label>
                                        <label style={{ cursor: 'pointer' }}>
                                            <input type="radio" name="isApplicantRigOwner" value="No" checked={formData.isApplicantRigOwner === 'No'} onChange={handleChange} /> No
                                        </label>
                                    </div>
                                </div>

                                {formData.isApplicantRigOwner === 'No' && (
                                    <div className="noc-card" style={{ background: '#fff3cd', border: '1px solid #ffc107', padding: '20px', marginTop: '15px' }}>
                                        <h4 style={{ marginTop: 0 }}>Authorization Required</h4>
                                        <div className="noc-form-group">
                                            <label className="noc-form-label required">Relationship Type</label>
                                            <select name="relationshipType" value={formData.relationshipType} onChange={handleChange} className="noc-form-control">
                                                <option value="">Select Relationship</option>
                                                {relationshipTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                            {errors.relationshipType && <p className="noc-form-error">{errors.relationshipType}</p>}
                                        </div>
                                        <div className="noc-form-group">
                                            <label className="noc-form-label required">Upload Authorization / Consent Letter from Rig Owner (Signed)</label>
                                            <input type="file" className="noc-form-control" accept=".pdf" />
                                            <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>PDF format, signed by the registered rig owner</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 4: Operation Area Request */}
                        {currentStep === 4 && (
                            <div>
                                <h3 className="noc-section-title">Section D: Operation Area Request</h3>
                                <div className="noc-alert noc-alert-warning" style={{ borderLeft: '4px solid #ff9800' }}>
                                    ⚠️ <strong>Rule:</strong> Rig operation outside approved jurisdiction is punishable under SGWA Act, 2025.
                                </div>
                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Requested District(s) for Operation</label>
                                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
                                        {formData.state && getDistricts(formData.state).map(d => (
                                            <div key={d} style={{ marginBottom: '5px' }}>
                                                <input
                                                    type="checkbox"
                                                    id={`dist_${d}`}
                                                    value={d}
                                                    checked={formData.operationDistricts.includes(d)}
                                                    onChange={(e) => handleMultiSelect(e, 'operationDistricts')}
                                                    style={{ width: 'auto', marginRight: '5px' }}
                                                />
                                                <label htmlFor={`dist_${d}`}>{d}</label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.operationDistricts && <p className="noc-form-error">{errors.operationDistricts}</p>}
                                </div>
                                <div className="noc-form-group">
                                    <label className="noc-form-label">Area Type</label>
                                    <select name="areaType" value={formData.areaType} onChange={handleChange} className="noc-form-control">
                                        <option value="">Select Area Type</option>
                                        <option value="Rural">Rural</option>
                                        <option value="Urban">Urban</option>
                                        <option value="Both">Both</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* STEP 5: Purpose & Period */}
                        {currentStep === 5 && (
                            <div>
                                <h3 className="noc-section-title">Section E: Purpose & Period</h3>
                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Purpose of Drilling (Select All that apply)</label>
                                    <div style={{ padding: '10px', border: '1px solid #ccc' }}>
                                        {operationPurposesList.map(p => (
                                            <div key={p} style={{ marginBottom: '5px' }}>
                                                <input
                                                    type="checkbox"
                                                    id={`purp_${p}`}
                                                    value={p}
                                                    checked={formData.operationPurposes.includes(p)}
                                                    onChange={(e) => handleMultiSelect(e, 'operationPurposes')}
                                                    style={{ width: 'auto', marginRight: '5px' }}
                                                />
                                                <label htmlFor={`purp_${p}`}>{p}</label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.operationPurposes && <p className="noc-form-error">{errors.operationPurposes}</p>}
                                </div>

                                <h4 style={{ marginTop: '20px' }}>Operation Period (Time Bound)</h4>
                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label requires">Duration</label>
                                        <select name="operationDuration" value={formData.operationDuration} onChange={handleChange} className="noc-form-control">
                                            <option value="">Select Duration</option>
                                            {operationDurations.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                        {errors.operationDuration && <p className="noc-form-error">{errors.operationDuration}</p>}
                                    </div>
                                    <div className="noc-form-group">
                                        <label className="noc-form-label">Expected Start Date</label>
                                        <input type="date" name="startDate" value={formData.startDate} min={today} onChange={handleChange} className="noc-form-control" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 6: Compliance & History */}
                        {currentStep === 6 && (
                            <div>
                                <h3 className="noc-section-title">Section F: Technical Compliance</h3>
                                <div className="noc-card" style={{ padding: '20px' }}>
                                    {[
                                        { key: 'complianceGroundwater', label: 'Rig will operate only against valid groundwater NOCs' },
                                        { key: 'complianceNotifiedArea', label: 'No drilling in notified / prohibited areas without specific permit' },
                                        { key: 'complianceDepth', label: 'No drilling beyond approved depth' },
                                        { key: 'complianceGPS', label: 'GPS / Tracking will be enabled during operation' },
                                        { key: 'complianceLogs', label: 'Drilling logs will be submitted to authority' }
                                    ].map(item => (
                                        <div key={item.key} style={{ marginBottom: '10px' }}>
                                            <input
                                                type="checkbox"
                                                name={item.key}
                                                checked={formData[item.key]}
                                                onChange={handleChange}
                                                style={{ width: 'auto', marginRight: '10px' }}
                                            />
                                            <label onClick={() => setFormData({ ...formData, [item.key]: !formData[item.key] })} style={errors[item.key] ? { color: 'red' } : {}}>{item.label}</label>
                                        </div>
                                    ))}
                                </div>

                                <h4 style={{ marginTop: '20px' }}>Past Violation Disclosure</h4>
                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Has the rig been penalized earlier?</label>
                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        <label><input type="radio" name="pastViolations" value="Yes" checked={formData.pastViolations === 'Yes'} onChange={handleChange} /> Yes</label>
                                        <label><input type="radio" name="pastViolations" value="No" checked={formData.pastViolations === 'No'} onChange={handleChange} /> No</label>
                                    </div>
                                </div>
                                {formData.pastViolations === 'Yes' && (
                                    <div className="noc-card" style={{ background: '#fff5f5', border: '1px solid #fc8181', padding: '15px' }}>
                                        <div className="noc-form-row two-col">
                                            <input type="text" name="violationReference" placeholder="Case Ref Number" className="noc-form-control" onChange={handleChange} />
                                            <input type="text" name="violationYear" placeholder="Year" className="noc-form-control" onChange={handleChange} />
                                        </div>
                                        <div className="noc-form-group">
                                            <label className="noc-form-label">Penalty Status: </label>
                                            <select className="noc-form-control" name="violationStatus" onChange={handleChange}>
                                                <option value="Pending">Pending</option>
                                                <option value="Paid">Paid</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 7: Affidavit & Undertaking */}
                        {currentStep === 7 && (
                            <div>
                                <h3 className="noc-section-title">Section G: Affidavit & Undertaking</h3>
                                <div className="noc-alert noc-alert-danger" style={{ marginBottom: '20px' }}>
                                    ⚠️ <strong>Portal Note:</strong> False declaration will lead to rejection, cancellation, and blacklisting.
                                </div>
                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Upload Standard Affidavit of Compliance</label>
                                    <input type="file" accept=".pdf" className="noc-form-control" />
                                    <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>Download the <a href="#" style={{ color: '#1976d2' }}>standard affidavit format (PDF)</a> and upload after signing.</p>
                                </div>
                                <div className="noc-form-group" style={{ marginTop: '20px' }}>
                                    <label className="noc-form-label">Past Penalty Clearance (if applicable)</label>
                                    <input type="file" accept=".pdf" className="noc-form-control" />
                                    <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '5px' }}>Upload payment receipt or clearance order if you declared past violations</p>
                                </div>
                            </div>
                        )}

                        {/* STEP 8: Fees */}
                        {currentStep === 8 && (
                            <div>
                                <h3 className="noc-section-title">Section H: Fee Payment</h3>
                                <div className="noc-card fee-breakdown" style={{ background: '#e9ecef', padding: '20px', borderRadius: '8px' }}>
                                    <div className="fee-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span>Application Fee:</span>
                                        <strong>₹ {formData.applicationFee}</strong>
                                    </div>
                                    <div className="fee-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span>Security Deposit (Refundable):</span>
                                        <strong>₹ {formData.securityDeposit}</strong>
                                    </div>
                                    <hr />
                                    <div className="fee-row total" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem' }}>
                                        <span>Total Payable:</span>
                                        <strong>₹ {formData.applicationFee + formData.securityDeposit}</strong>
                                    </div>
                                </div>
                                <div className="noc-form-group" style={{ marginTop: '20px' }}>
                                    <label className="noc-form-label required">Payment Mode</label>
                                    <select name="paymentMode" className="noc-form-control">
                                        <option value="">Select Mode</option>
                                        <option value="NetBanking">Net Banking (Govt Gateway)</option>
                                        <option value="Challan">E-Challan</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* STEP 9: Declaration */}
                        {currentStep === 9 && (
                            <div>
                                <h3 className="noc-section-title">Section I: Final Declaration</h3>
                                <div className="noc-card" style={{ padding: '20px', border: '1px solid #dee2e6' }}>
                                    <p style={{ fontStyle: 'italic', fontWeight: 'bold' }}>
                                        “I hereby declare that the rig shall be operated strictly in accordance with the conditions of the Rig NOC and applicable groundwater laws. Any violation shall render the NOC liable for cancellation and penal action.”
                                    </p>
                                    <div style={{ marginTop: '20px' }}>
                                        <input
                                            type="checkbox"
                                            id="finalDec"
                                            name="declarationAgreed"
                                            checked={formData.declarationAgreed}
                                            onChange={handleChange}
                                            style={{ width: 'auto', marginRight: '10px' }}
                                        />
                                        <label htmlFor="finalDec">I Agree to the above terms and conditions</label>
                                    </div>
                                    {errors.declarationAgreed && <p className="noc-form-error">{errors.declarationAgreed}</p>}
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="form-actions" style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
                            <button
                                className="noc-btn noc-btn-secondary"
                                onClick={handlePrevious}
                                disabled={currentStep === 1}
                            >
                                Previous
                            </button>

                            {currentStep < rigOperationSteps.length ? (
                                <button
                                    className="noc-btn noc-btn-primary"
                                    onClick={handleNext}
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    className="noc-btn noc-btn-primary"
                                    onClick={handleSubmit}
                                    style={{ background: '#28a745', borderColor: '#28a745' }}
                                >
                                    Submit Application
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <NOCFooter />
            <LegalDisclaimer />
        </div>
    );
};

export default RigOperationApplication;
