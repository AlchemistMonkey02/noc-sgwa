import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import NOCHeader from './components/NOCHeader';
import NOCFooter from './components/NOCFooter';
import ProgressSteps from './components/ProgressSteps';
import FormNavigation from './components/FormNavigation';
import LegalDisclaimer from '../../components/LegalDisclaimer';
import './styles/noc-portal.css';
import {
    initialRigFormData,
    rigFormSteps,
    rigTypes,
    rigMountingTypes,
    rigApplicationTypes,
    applicantCategories,
    validateRigStep
} from './utils/rigFormData';
import { states } from './utils/formData';
import { getDistricts } from './utils/blockClassification';

const RigNOCApplication = () => {
    const navigate = useNavigate();
    const { success: toastSuccess } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(initialRigFormData);
    const [errors, setErrors] = useState({});

    // Temporary state for Rig Search
    const [searchRigNo, setSearchRigNo] = useState('');
    const [rigSearchError, setRigSearchError] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentStep]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // clear error
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleNext = () => {
        const stepErrors = validateRigStep(currentStep, formData);
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }
        setCurrentStep(prev => prev + 1);
    };

    const handlePrevious = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleRigSearch = () => {
        const foundRig = MOCK_RIG_DB.find(r => r.regNo === searchRigNo);
        if (foundRig) {
            if (foundRig.status !== 'Active') {
                setRigSearchError('Rig is found but status is ' + foundRig.status + '. Cannot proceed.');
            } else {
                setRigSearchError('');
                setFormData(prev => ({
                    ...prev,
                    rigId: foundRig.id,
                    rigRegNo: foundRig.regNo,
                    rigOwnerName: foundRig.owner,
                    rigType: foundRig.type,
                    rigCapacity: foundRig.capacity,
                    maxDepth: foundRig.maxDepth,
                    boreDiameter: foundRig.diameter,
                    rigStatus: foundRig.status
                }));
            }
        } else {
            setRigSearchError('Rig Registration Number not found in registry.');
        }
    };

    const handlePinDrop = () => {
        // Simulating pin drop for now
        // In real app, this would open a map modal
        setFormData(prev => ({
            ...prev,
            latitude: '28.6139',
            longitude: '77.2090'
        }));
        toastSuccess('Pinned location successfully (Mock)');
    };

    const handleSubmit = () => {
        const stepErrors = validateRigStep(currentStep, formData);
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }

        const applicationId = 'RIGNOC' + Date.now();
        const submissionData = {
            ...formData,
            applicationId,
            submittedAt: new Date().toISOString(),
            status: 'Submitted'
        };

        console.log('Rig Application Submitted:', submissionData);
        toastSuccess(`Application Submitted Successfully! Application ID: ${applicationId}`);
        navigate('/noc/dashboard');
    };

    return (
        <div className="noc-portal">
            <NOCHeader />
            <div className="noc-container" style={{ padding: '30px 15px' }}>
                <div className="noc-application-wrapper">
                    <div className="noc-form-header">
                        <h2>Rig Registration Application</h2>
                        <p>Application for Registration of Drilling Rig / Machinery under SGWA Act, 2025</p>
                    </div>

                    <ProgressSteps steps={rigFormSteps} currentStep={currentStep} />

                    <div className="noc-form-content">

                        {/* STEP 1: Application Type */}
                        {currentStep === 1 && (
                            <div>
                                <h3 className="noc-section-title">Section A: Application Details</h3>
                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Application Type</label>
                                        <select name="applicationType" value={formData.applicationType} onChange={handleChange} className={`noc-form-control ${errors.applicationType ? 'error' : ''}`}>
                                            <option value="">Select Type</option>
                                            {rigApplicationTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        {errors.applicationType && <span className="noc-form-error">{errors.applicationType}</span>}
                                    </div>
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Rig Category</label>
                                        <select name="rigCategory" value={formData.rigCategory} onChange={handleChange} className={`noc-form-control ${errors.rigCategory ? 'error' : ''}`}>
                                            <option value="">Select Category</option>
                                            {rigTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        {errors.rigCategory && <span className="noc-form-error">{errors.rigCategory}</span>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Applicant Details */}
                        {currentStep === 2 && (
                            <div>
                                <h3 className="noc-section-title">Section B: Applicant Details</h3>
                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Applicant Category</label>
                                        <select name="applicantCategory" value={formData.applicantCategory} onChange={handleChange} className="noc-form-control">
                                            <option value="">Select Category</option>
                                            {applicantCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Applicant Name / Firm Name</label>
                                        <input type="text" name="applicantName" value={formData.applicantName} onChange={handleChange} className="noc-form-control" />
                                        {errors.applicantName && <span className="noc-form-error">{errors.applicantName}</span>}
                                    </div>
                                </div>
                                <div className="noc-form-row three-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Mobile Number</label>
                                        <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className="noc-form-control" maxLength="10" />
                                        {errors.mobileNumber && <span className="noc-form-error">{errors.mobileNumber}</span>}
                                    </div>
                                    <div className="noc-form-group">
                                        <label className="noc-form-label">GST Number</label>
                                        <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} className="noc-form-control" />
                                    </div>
                                    <div className="noc-form-group">
                                        <label className="noc-form-label">PAN Number</label>
                                        <input type="text" name="panNumber" value={formData.panNumber} onChange={handleChange} className="noc-form-control" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Address & Location */}
                        {currentStep === 3 && (
                            <div>
                                <h3 className="noc-section-title">Section C: Address & Base Location</h3>
                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Full Address</label>
                                    <textarea name="address" value={formData.address} onChange={handleChange} className="noc-form-control" rows="3" />
                                    {errors.address && <span className="noc-form-error">{errors.address}</span>}
                                </div>
                                <div className="noc-form-row three-col">
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
                                        {errors.district && <span className="noc-form-error">{errors.district}</span>}
                                    </div>
                                    <div className="noc-form-group">
                                        <label className="noc-form-label">Pincode</label>
                                        <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="noc-form-control" />
                                    </div>
                                </div>
                                <div className="noc-form-group">
                                    <label className="noc-form-label">Base Location / Yard Address</label>
                                    <input type="text" name="baseLocation" value={formData.baseLocation} onChange={handleChange} className="noc-form-control" placeholder="Where is the rig normally parked?" />
                                </div>
                            </div>
                        )}

                        {/* STEP 4: Vehicle Details */}
                        {currentStep === 4 && (
                            <div>
                                <h3 className="noc-section-title">Section D1: Vehicle / Truck Details</h3>
                                <div className="noc-alert noc-alert-info">
                                    Provide details of the vehicle on which the rig is mounted or transported.
                                </div>
                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Vehicle Registration No. (RTO)</label>
                                        <input type="text" name="vehicleRegNo" value={formData.vehicleRegNo} onChange={handleChange} className="noc-form-control" placeholder="e.g. RJ-14-GA-1234" />
                                        {errors.vehicleRegNo && <span className="noc-form-error">{errors.vehicleRegNo}</span>}
                                    </div>
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Chassis Number</label>
                                        <input type="text" name="vehicleChassisNo" value={formData.vehicleChassisNo} onChange={handleChange} className="noc-form-control" />
                                        {errors.vehicleChassisNo && <span className="noc-form-error">{errors.vehicleChassisNo}</span>}
                                    </div>
                                </div>
                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Vehicle Make</label>
                                        <input type="text" name="vehicleMake" value={formData.vehicleMake} onChange={handleChange} className="noc-form-control" />
                                    </div>
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Engine Number</label>
                                        <input type="text" name="vehicleEngineNo" value={formData.vehicleEngineNo} onChange={handleChange} className="noc-form-control" />
                                    </div>
                                </div>
                                <div className="noc-form-row three-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Insurance Valid Upto</label>
                                        <input type="date" name="insuranceValidUpto" value={formData.insuranceValidUpto} onChange={handleChange} className="noc-form-control" />
                                        {errors.insuranceValidUpto && <span className="noc-form-error">{errors.insuranceValidUpto}</span>}
                                    </div>
                                    <div className="noc-form-group">
                                        <label className="noc-form-label">Road Tax Valid Upto</label>
                                        <input type="date" name="roadTaxValidUpto" value={formData.roadTaxValidUpto} onChange={handleChange} className="noc-form-control" />
                                    </div>
                                    <div className="noc-form-group">
                                        <label className="noc-form-label">PUC Valid Upto</label>
                                        <input type="date" name="pucValidUpto" value={formData.pucValidUpto} onChange={handleChange} className="noc-form-control" />
                                    </div>
                                </div>
                                <div className="noc-form-group">
                                    <label className="noc-form-label required">GPS/Telemetry IMEI Number</label>
                                    <input type="text" name="gpsImei" value={formData.gpsImei} onChange={handleChange} className="noc-form-control" placeholder="15-digit IMEI for tracking" />
                                </div>
                            </div>
                        )}

                        {/* STEP 5: Machine Specs */}
                        {currentStep === 5 && (
                            <div>
                                <h3 className="noc-section-title">Section D2: Machine / Rig Specifications</h3>
                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Rig Serial Number</label>
                                        <input type="text" name="rigSerialNo" value={formData.rigSerialNo} onChange={handleChange} className="noc-form-control" />
                                        {errors.rigSerialNo && <span className="noc-form-error">{errors.rigSerialNo}</span>}
                                    </div>
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Rig Mounting Type</label>
                                        <select name="rigMountingType" value={formData.rigMountingType} onChange={handleChange} className="noc-form-control">
                                            <option value="">Select Mounting</option>
                                            {rigMountingTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Rig Mounting Type</label>
                                        <select name="rigMountingType" value={formData.rigMountingType} onChange={handleChange} className="noc-form-control">
                                            <option value="">Select Mounting</option>
                                            {rigMountingTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label">Year of Manufacture</label>
                                        <input type="number" name="yearOfMfg" value={formData.yearOfMfg} onChange={handleChange} className="noc-form-control" placeholder="YYYY" />
                                    </div>
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Max Capacity (Depth in m)</label>
                                        <input type="number" name="rigCapacityDepth" value={formData.rigCapacityDepth} onChange={handleChange} className="noc-form-control" />
                                        {errors.rigCapacityDepth && <span className="noc-form-error">{errors.rigCapacityDepth}</span>}
                                    </div>
                                </div>
                                <div className="noc-form-group">
                                    <label className="noc-form-label">Max Regulated Diameter (mm)</label>
                                    <input type="number" name="rigCapacityDiameter" value={formData.rigCapacityDiameter} onChange={handleChange} className="noc-form-control" />
                                </div>
                                <h4 style={{ marginTop: '20px', borderBottom: '1px solid #ddd' }}>Compressor Details</h4>
                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label">Compressor Make</label>
                                        <input type="text" name="compressorMake" value={formData.compressorMake} onChange={handleChange} className="noc-form-control" />
                                    </div>
                                    <div className="noc-form-group">
                                        <label className="noc-form-label">Compressor Serial No</label>
                                        <input type="text" name="compressorSerialNo" value={formData.compressorSerialNo} onChange={handleChange} className="noc-form-control" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 6: Operator */}
                        {currentStep === 6 && (
                            <div>
                                <h3 className="noc-section-title">Section D3: Operator / Staff Details</h3>
                                <div className="noc-form-row two-col">
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Primary Operator Name</label>
                                        <input type="text" name="operatorName" value={formData.operatorName} onChange={handleChange} className="noc-form-control" />
                                    </div>
                                    <div className="noc-form-group">
                                        <label className="noc-form-label required">Operator Mobile</label>
                                        <input type="text" name="operatorMobile" value={formData.operatorMobile} onChange={handleChange} className="noc-form-control" />
                                    </div>
                                </div>
                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Operator Driving License No.</label>
                                    <input type="text" name="operatorLicenseNo" value={formData.operatorLicenseNo} onChange={handleChange} className="noc-form-control" />
                                </div>
                                <div className="noc-form-group">
                                    <label className="noc-form-label">Helper Name</label>
                                    <input type="text" name="helperName" value={formData.helperName} onChange={handleChange} className="noc-form-control" />
                                </div>
                            </div>
                        )}

                        {/* STEP 7: Proposed Work / Activity */}
                        {currentStep === 7 && (
                            <div>
                                <h3 className="noc-section-title">Section E: Proposed Activity</h3>
                                <div className="noc-form-group">
                                    <label className="noc-form-label required">Proposed Activity / Purpose</label>
                                    <textarea name="proposedActivity" value={formData.proposedActivity} onChange={handleChange} className="noc-form-control" placeholder="Describe the type of drilling work generally undertaken" />
                                </div>
                            </div>
                        )}

                        {/* STEP 8: Movement Plan (New) */}
                        {currentStep === 8 && (
                            <div>
                                <h3 className="noc-section-title">Section F: Movement Plan</h3>
                                <div className="noc-alert noc-alert-warning">
                                    Indicate the districts where the machine is likely to operate.
                                </div>
                                <div className="noc-form-group">
                                    <label className="noc-form-label">Districts of Operation</label>
                                    {/* Multi-select simulation */}
                                    <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
                                        {formData.state && getDistricts(formData.state).map(d => (
                                            <div key={d} style={{ marginBottom: '5px' }}>
                                                <input type="checkbox" id={`dist_${d}`} name="movementDistrict" value={d} style={{ width: 'auto', marginRight: '5px' }} />
                                                <label htmlFor={`dist_${d}`}>{d}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 9: Documents */}
                        {currentStep === 9 && (
                            <div>
                                <h3 className="noc-section-title">Section G: Documents</h3>
                                {[
                                    'Vehicle Registration Certificate (RC)',
                                    'Vehicle Insurance Copy',
                                    'Pollution Under Control (PUC)',
                                    'Rig Machine Invoice / Ownership Proof',
                                    'GPS Installation Certificate',
                                    'Photo: Front View with Number Plate',
                                    'Photo: Side View of Machine'
                                ].map((doc, i) => (
                                    <div className="noc-form-group" key={i} style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                        <label className="noc-form-label">{doc}</label>
                                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="noc-form-control" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* STEP 11: Declaration */}
                        {currentStep === 11 && (
                            <div>
                                <h3 className="noc-section-title">Section I: Declaration</h3>
                                <div className="noc-card" style={{ padding: '20px', border: '1px solid #dee2e6' }}>
                                    <p>I hereby declare that:</p>
                                    <ul style={{ paddingLeft: '20px' }}>
                                        <li>The details of the Rig and Vehicle provided above are true and correct.</li>
                                        <li>I will install and maintain a GPS tracking system on the machine.</li>
                                        <li>I will not undertake drilling in notified/banned areas without specific permission.</li>
                                        <li>I will update the movement plan on the portal whenever the rig moves to a new district.</li>
                                    </ul>
                                    <div style={{ marginTop: '20px' }}>
                                        <input
                                            type="checkbox"
                                            id="declaration"
                                            name="declarationAgreed"
                                            checked={formData.declarationAgreed}
                                            onChange={handleChange}
                                            style={{ width: 'auto', marginRight: '10px' }}
                                        />
                                        <label htmlFor="declaration" style={{ fontWeight: 'bold' }}>I Agree to the above terms and conditions</label>
                                    </div>
                                    {errors.declarationAgreed && <p style={{ color: 'red', marginTop: '5px' }}>{errors.declarationAgreed}</p>}
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

                            {currentStep < rigFormSteps.length ? (
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
                                    Submit Registration
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

export default RigNOCApplication;
