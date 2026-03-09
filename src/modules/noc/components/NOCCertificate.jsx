import React, { useState } from 'react';
import { useToast } from '../../../context/ToastContext';
import { nocApplicationService } from '../services/nocApplicationService';
import '../styles/CertificateTemplate.css';

const NOCCertificate = ({ nocData }) => {
    const { info: toastInfo, success: toastSuccess, error: toastError } = useToast();
    const [isDownloading, setIsDownloading] = useState(false);

    // Safeguard extraction for nested API data structure
    const application = nocData?.applicationId || {};
    const projectDetails = application?.projectDetails || {};
    const locationInfo = application?.location || {};

    // Water Requirements (Section 4) - Abstracted Structure Handling
    const waterReq = application?.waterRequirementBreakup || {};
    const gwReq = waterReq.groundWaterRequirement || {};
    const dewateringReq = waterReq.dewateringRequirement || {};

    // Map extracted data with defaults
    const {
        // Project parsing 
        companyName = projectDetails?.projectName || 'N/A',
        projectAddress = locationInfo?.address || 'N/A',
        pinCode = locationInfo?.pincode || '',
        state = locationInfo?.stateId || 'Rajasthan',
        district = locationInfo?.districtId || 'N/A',
        town = locationInfo?.village || locationInfo?.tehsil || '',
        block = locationInfo?.blockId || '',
        communicationAddress = 'Registered Office Address',

        // Certificate Core Data
        nocNumber = nocData?.nocNumber || 'N/A',
        applicationNumber = application?.applicationNumber || 'N/A',
        nocType = application?.applicationType || 'New',
        projectStatus = application?.projectStatus || 'Existing',
        category = locationInfo?.blockCategory || 'Safe',

        // Format dates correctly from ISO strings if present
        issueDate = nocData?.issueDate ? new Date(nocData.issueDate).toLocaleDateString() : '',
        validFrom = nocData?.validFrom ? new Date(nocData.validFrom).toLocaleDateString() : '',
        validUpto = nocData?.validUpto ? new Date(nocData.validUpto).toLocaleDateString() : '',

        // Approved Quantities
        approvedWaterQuantity = nocData?.approvedWaterQuantity || gwReq.totalRequirementKld || '0.00',
        approvedWaterQuantityAnnual = nocData?.approvedWaterQuantityAnnual || gwReq.totalRequirementAnnual || '0.00',

        // Structures Data (Placeholder logic, abstracting true API shape if needed)
        structures = application?.groundWaterStructures || {},
        total_ex = structures.existingTotal || 0, total_prop = structures.proposedTotal || 0, grand_total = (structures.existingTotal || 0) + (structures.proposedTotal || 0),
        dw_ex = structures.existingDW || 0, dcb_ex = structures.existingDCB || 0, bw_ex = structures.existingBW || 0, tw_ex = structures.existingTW || 0, mpu_ex = structures.existingMPU || 0,
        dw_prop = structures.proposedDW || 0, dcb_prop = structures.proposedDCB || 0, bw_prop = structures.proposedBW || 0, tw_prop = structures.proposedTW || 0, mpu_prop = structures.proposedMPU || 0,
        total_dw = dw_ex + dw_prop, total_dcb = dcb_ex + dcb_prop, total_bw = bw_ex + bw_prop, total_tw = tw_ex + tw_prop, total_mpu = mpu_ex + mpu_prop,

        emblemImage = '/logos/india-emblem.png',
        qrCodeImage = nocData?.qrCode,
        signatureImage
    } = nocData || {};

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = async () => {
        if (!nocNumber || nocNumber === 'N/A') {
            toastError("Cannot download: Invalid NOC Number.");
            return;
        }

        try {
            setIsDownloading(true);
            toastInfo('Downloading certificate...');
            // Assumes API route is /applications/noc/ref/:trackingId/document, trackingId seems to act as refNumber
            const trackingId = application?.trackingId || nocNumber;
            await nocApplicationService.downloadCertificate(trackingId);
            toastSuccess('Certificate downloaded successfully.');
        } catch (error) {
            console.error('Download error:', error);
            if (error.response?.data?.error?.code === 'FILE_NOT_FOUND_ON_DISK') {
                toastError("Certificate file is missing from storage on the server.");
            } else {
                toastError("Failed to download certificate. " + (error.message || ""));
            }
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="noc-certificate-container">
            <div className="noc-actions no-print" style={{ marginBottom: '20px', textAlign: 'right' }}>
                <button className="bhuneer-submit-btn" onClick={handlePrint} style={{ marginRight: '10px' }}>
                    🖨️ Print Certificate
                </button>
                <button
                    className="bhuneer-secondary-btn"
                    onClick={handleDownload}
                    disabled={isDownloading}
                >
                    {isDownloading ? '⏳ Downloading...' : '📥 Download PDF'}
                </button>
            </div>

            <div className="certificate-wrapper">
                {/* Header */}
                <table className="header-table" style={{ border: 'none' }}>
                    <tbody>
                        <tr style={{ border: 'none' }}>
                            <td className="header-left" style={{ border: 'none' }}>
                                भारत सरकार<br />
                                जल शक्ति मंत्रालय<br />
                                GOVERNMENT OF INDIA<br />
                                MINISTRY OF JAL SHAKTI<br />
                                CENTRAL GROUND WATER AUTHORITY
                            </td>
                            <td className="header-center" style={{ border: 'none' }}>
                                {emblemImage ? (
                                    <img src={emblemImage} alt="Emblem" />
                                ) : (
                                    <div style={{ fontSize: '30px' }}>🏛️</div>
                                )}
                                <div style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '2px' }}>सत्यमेव जयते</div>
                            </td>
                            <td className="header-right" style={{ border: 'none' }}>
                                {qrCodeImage ? (
                                    <img src={qrCodeImage} className="qr-code" alt="QR" />
                                ) : (
                                    <div className="qr-code" style={{ border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' }}>
                                        QR
                                    </div>
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div style={{ borderBottom: '1px solid #000', marginBottom: '10px' }}></div>

                <div className="noc-title-hindi">भूजल निकासी हेतु अनापत्ति प्रमाण पत्र</div>
                <div className="noc-title-eng">NO OBJECTION CERTIFICATE (NOC) FOR GROUND WATER ABSTRACTION</div>

                {/* Project Info Grid */}
                <table className="details-table" style={{ border: '1px solid #ccc' }}>
                    <tbody>
                        <tr>
                            <td colSpan="3">
                                <span className="label">PROJECT NAME</span>&nbsp; <span className="value">{companyName}</span>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="2">
                                <span className="label">PROJECT ADDRESS</span>&nbsp; <span className="value">{projectAddress}</span>
                            </td>
                            <td style={{ width: '25%' }}>
                                <span className="label">PIN CODE</span>&nbsp; <span className="value">{pinCode}</span>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span className="label">STATE</span>&nbsp; <span className="value">{state}</span>
                            </td>
                            <td>
                                <span className="label">DISTRICT</span>&nbsp; <span className="value">{district}</span>
                            </td>
                            <td>
                                <span className="label">TOWN/BLOCK</span><br />
                                <span className="value">{town} / {block}</span>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="3">
                                <span className="label">COMMUNICATION ADDRESS</span>&nbsp; <span className="value">{communicationAddress}</span>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="3">
                                <span className="label">ADDRESS OF SGWA REGIONAL OFFICE</span>&nbsp; <span className="value">State Ground Water Authority, Jaipur, Rajasthan</span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* NOC Details Numbers */}
                <table className="numbered-table" style={{ border: '1px solid #ccc' }}>
                    <tbody>
                        <tr>
                            <td><span className="num-label">1. NOC NO.</span> <span className="num-value">{nocNumber}</span></td>
                            <td><span class="num-label">2. DATE OF ISSUANCE</span> <span className="num-value">{issueDate}</span></td>
                        </tr>
                        <tr>
                            <td><span className="num-label">3. APPLICATION NO.</span> <span className="num-value">{applicationNumber}</span></td>
                            <td><span className="num-label">4. APPLICATION TYPE</span> <span className="num-value">{nocType}</span></td>
                        </tr>
                        <tr>
                            <td><span className="num-label">5. PROJECT STATUS</span> <span className="num-value">{projectStatus}</span></td>
                            <td><span className="num-label">6. NOC TYPE</span> <span className="num-value">{nocType}</span></td>
                        </tr>
                        <tr>
                            <td><span className="num-label">7. VALID FROM</span> <span className="num-value">{validFrom}</span></td>
                            <td><span className="num-label">8. VALID UP TO</span> <span className="num-value">{validUpto}</span></td>
                        </tr>
                        <tr>
                            <td><span className="num-label">9. WATER QUALITY TYPE</span> <span className="num-value">Fresh Water</span></td>
                            <td><span className="num-label">10. AREA TYPE CATEGORY</span> <span className="num-value">{category} (GWRE - 2024)</span></td>
                        </tr>
                    </tbody>
                </table>

                {/* Section 11 */}
                <div className="blue-header">11. Ground Water Abstraction Permitted</div>
                <table className="tech-table">
                    <thead>
                        <tr>
                            <th rowSpan="2" style={{ width: '40%' }}>GW Abstraction</th>
                            <th colSpan="2">Dewatering</th>
                            <th colSpan="2">Total</th>
                        </tr>
                        <tr>
                            <th>m³/day</th>
                            <th>m³/year</th>
                            <th>m³/day</th>
                            <th>m³/year</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Ground Water Abstraction</strong></td>
                            <td>0.00</td>
                            <td>0.00</td>
                            <td><strong>{approvedWaterQuantity}</strong></td>
                            <td><strong>{approvedWaterQuantityAnnual}</strong></td>
                        </tr>
                        <tr>
                            <td><strong>Dewatering</strong></td>
                            <td>0.00</td>
                            <td>0.00</td>
                            <td><strong>0.00</strong></td>
                            <td><strong>0.00</strong></td>
                        </tr>
                        <tr style={{ backgroundColor: '#eee' }}>
                            <td><strong>Total</strong></td>
                            <td><strong>0.00</strong></td>
                            <td><strong>0.00</strong></td>
                            <td><strong>{approvedWaterQuantity}</strong></td>
                            <td><strong>{approvedWaterQuantityAnnual}</strong></td>
                        </tr>
                    </tbody>
                </table>

                {/* Section 12 */}
                <div className="blue-header">12. Details of Ground Water Abstraction / Dewatering Structures</div>
                <table className="tech-table">
                    <thead>
                        <tr>
                            <th colSpan="5">EXISTING &nbsp; {total_ex}</th>
                            <th colSpan="5">PROPOSED &nbsp; {total_prop}</th>
                            <th colSpan="5">TOTAL &nbsp; {grand_total}</th>
                        </tr>
                        <tr style={{ fontSize: '9px' }}>
                            {/* Existing Header */}
                            <th>DW</th><th>DCB</th><th>BW</th><th>TW</th><th>Pu</th>
                            {/* Proposed Header */}
                            <th>DW</th><th>DCB</th><th>BW</th><th>TW</th><th>Pu</th>
                            {/* Total Header */}
                            <th>DW</th><th>DCB</th><th>BW</th><th>TW</th><th>Pu</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {/* Existing Values */}
                            <td>{dw_ex}</td><td>{dcb_ex}</td><td>{bw_ex}</td><td>{tw_ex}</td><td>{mpu_ex}</td>
                            {/* Proposed Values */}
                            <td>{dw_prop}</td><td>{dcb_prop}</td><td>{bw_prop}</td><td>{tw_prop}</td><td>{mpu_prop}</td>
                            {/* Total Values */}
                            <td>{total_dw}</td><td>{total_dcb}</td><td>{total_bw}</td><td>{total_tw}</td><td>{total_mpu}</td>
                        </tr>
                    </tbody>
                </table>
                <div className="footer-note">*DW-Dug Well; DCB-Dug-cum-Bore Well; BW-Bore Well; TW-Tube Well; Pu-Pumps</div>

                {/* Conditions */}
                <div style={{ fontWeight: 'bold', marginTop: '15px', fontSize: '11px' }}>
                    Validity of this NOC shall be subject to mandatory compliance of the following conditions:
                </div>

                <div className="conditions">
                    <h4>Phase I (within 30 days)</h4>
                    <ol>
                        <li>Installation of tamper proof digital water flow meter with telemetry on all the abstraction structure(s) is mandatory for all users seeking No Objection Certificate. Intimation regarding their installation shall be updated in Self-Compliance Module.</li>
                        <li>Installation of Piezometers with Digital Water Level Recorders (DWLR) and Telemetry is mandatory.</li>
                    </ol>
                </div>

                <div className="watermark">
                    <br />
                    {signatureImage && (
                        <img src={signatureImage} style={{ maxHeight: '50px', float: 'right' }} alt="Sig" />
                    )}
                </div>

            </div>
        </div>
    );
};

export default NOCCertificate;
