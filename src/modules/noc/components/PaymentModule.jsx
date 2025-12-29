import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { calculateApplicationFee, generateReceiptNumber, generateTransactionId, formatCurrency, formatDate } from '../utils/paymentUtils';
import { calculateAdvancedCharges, getChargeBreakdown } from '../utils/advancedChargeCalculation';
import { getBlockCategory } from '../utils/blockClassification';

const PaymentModule = ({ formData, onPaymentComplete }) => {
    const [fees, setFees] = useState({ baseFee: 0, gstAmount: 0, totalAmount: 0 });
    const [advancedCharges, setAdvancedCharges] = useState(null);
    const [chargeBreakdown, setChargeBreakdown] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('online');
    const [processing, setProcessing] = useState(false);
    const [paymentCompleted, setPaymentCompleted] = useState(false);
    const [receiptData, setReceiptData] = useState(null);

    useEffect(() => {
        // Use enhanced charge calculation if block category is available
        if (formData.district && formData.block && formData.dailyWaterRequirement) {
            const blockCategoryObj = getBlockCategory(formData.district, formData.block);
            
            if (blockCategoryObj) {
                // Determine project category
                let projectCategory = 'Industry';
                if (formData.groundWaterUtilizationFor === 'Mining') {
                    projectCategory = 'Mining';
                } else if (formData.groundWaterUtilizationFor !== 'Industry') {
                    projectCategory = 'Other';
                }

                // Check if provisional NOC
                const isProvisional = formData.applicationType === 'Provisional NOC' || formData.applicationSubType === 'Provisional';

                const charges = calculateAdvancedCharges({
                    dailyWaterRequirement: parseFloat(formData.dailyWaterRequirement) || 0,
                    blockCategory: blockCategoryObj.name,
                    applicationType: formData.applicationType || 'Fresh NOC',
                    projectCategory: projectCategory,
                    isExempt: formData.isExempt || false,
                    isProvisional: isProvisional
                });

                setAdvancedCharges(charges);
                setChargeBreakdown(getChargeBreakdown(charges));
                
                // Set fees for backward compatibility
                setFees({
                    baseFee: charges.applicationFee,
                    gstAmount: charges.gstAmount,
                    totalAmount: charges.totalAmount
                });
            } else {
                // Fallback to old calculation if block category not found
                const calculatedFees = calculateApplicationFee(formData);
                setFees(calculatedFees);
                setAdvancedCharges(null);
                setChargeBreakdown(null);
            }
        } else {
            // Fallback to old calculation
            const calculatedFees = calculateApplicationFee(formData);
            setFees(calculatedFees);
            setAdvancedCharges(null);
            setChargeBreakdown(null);
        }
    }, [formData]);

    const generateReceiptPDF = (paymentDetails) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(13, 74, 143);
        doc.text('PAYMENT RECEIPT', 105, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Central Ground Water Authority', 105, 30, { align: 'center' });
        doc.text('BhuNeer NOC Application Portal', 105, 37, { align: 'center' });

        // Divider line
        doc.setLineWidth(0.5);
        doc.line(20, 45, 190, 45);

        // Receipt Details
        doc.setFontSize(10);
        doc.text(`Receipt No: ${paymentDetails.receiptNumber}`, 20, 55);
        doc.text(`Transaction ID: ${paymentDetails.transactionId}`, 20, 62);
        doc.text(`Date: ${paymentDetails.date}`, 20, 69);

        // Applicant Details
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Applicant Details:', 20, 82);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text(`Name: ${formData.applicantName || 'N/A'}`, 20, 90);
        doc.text(`Organization: ${formData.organizationName || 'N/A'}`, 20, 97);
        doc.text(`Application Type: ${formData.applicationType}`, 20, 104);

        if (formData.isExemptMSME) {
            doc.setTextColor(40, 167, 69);
            doc.text('Status: MSME Exempt Application', 20, 111);
            doc.setTextColor(0, 0, 0);
        }

        // Fee Breakdown Table
        let feeBreakdownBody = [];
        if (advancedCharges && chargeBreakdown) {
            chargeBreakdown.details.forEach(item => {
                if (!item.isSubtotal) {
                    feeBreakdownBody.push([item.label, item.value.replace('₹', '').replace(/,/g, '')]);
                }
            });
        } else {
            feeBreakdownBody = [
                ['Base Application Fee', formatCurrency(fees.baseFee)],
                ['GST (18%)', formatCurrency(fees.gstAmount)],
                ['Total Amount', formatCurrency(fees.totalAmount)]
            ];
        }

        doc.autoTable({
            startY: 120,
            head: [['Description', 'Amount']],
            body: feeBreakdownBody,
            theme: 'striped',
            headStyles: { fillColor: [13, 74, 143] },
            footStyles: { fillColor: [13, 74, 143], fontStyle: 'bold' }
        });

        // Payment Method
        const finalY = doc.previousAutoTable.finalY + 10;
        doc.text(`Payment Method: ${paymentMethod === 'online' ? 'Online Payment' : 'Offline Payment'}`, 20, finalY);
        doc.text(`Status: PAID`, 20, finalY + 7);

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(108, 117, 125);
        doc.text('This is a computer-generated receipt and does not require a signature.', 105, 280, { align: 'center' });
        doc.text('For any queries, please contact: support@cgwa-noc.gov.in', 105, 285, { align: 'center' });

        return doc;
    };

    const handlePayment = async () => {
        setProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        const paymentDetails = {
            receiptNumber: generateReceiptNumber(),
            transactionId: generateTransactionId(),
            date: formatDate(new Date()),
            amount: fees.totalAmount,
            method: paymentMethod
        };

        setReceiptData(paymentDetails);
        setPaymentCompleted(true);
        setProcessing(false);

        // Notify parent component
        onPaymentComplete({
            ...paymentDetails,
            baseFee: advancedCharges ? advancedCharges.applicationFee : fees.baseFee,
            gstAmount: advancedCharges ? advancedCharges.gstAmount : fees.gstAmount,
            totalAmount: advancedCharges ? advancedCharges.totalAmount : fees.totalAmount,
            paymentStatus: 'paid',
            advancedCharges: advancedCharges
        });
    };

    const downloadReceipt = () => {
        if (!receiptData) return;

        const doc = generateReceiptPDF(receiptData);
        doc.save(`CGWA_Receipt_${receiptData.receiptNumber}.pdf`);
    };

    return (
        <div className="noc-payment-module">
            <h3 className="noc-section-title">Application Fee Payment</h3>

            {/* Fee Breakdown */}
            <div className="noc-card" style={{ marginBottom: '30px' }}>
                <div className="noc-card-header">Charge Breakdown</div>
                <div className="noc-card-body">
                    {chargeBreakdown ? (
                        // Enhanced charge breakdown
                        <table className="noc-table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th style={{ textAlign: 'right' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chargeBreakdown.details.map((item, index) => {
                                    if (item.isTotal) {
                                        return (
                                            <tr key={index} style={{ background: 'var(--cgwa-primary)', color: 'white', fontWeight: 'bold' }}>
                                                <td>{item.label}</td>
                                                <td style={{ textAlign: 'right', fontSize: '1.2rem' }}>{item.value}</td>
                                            </tr>
                                        );
                                    }
                                    if (item.isSubtotal) {
                                        return (
                                            <tr key={index} style={{ background: '#f8f9fa', fontWeight: '600' }}>
                                                <td>{item.label}</td>
                                                <td style={{ textAlign: 'right' }}>{item.value}</td>
                                            </tr>
                                        );
                                    }
                                    return (
                                        <tr key={index}>
                                            <td>
                                                <strong>{item.label}</strong>
                                                {item.description && (
                                                    <>
                                                        <br />
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--cgwa-text-secondary)' }}>
                                                            {item.description}
                                                        </span>
                                                    </>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>{item.value}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        // Fallback to basic fee breakdown
                        <table className="noc-table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th style={{ textAlign: 'right' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <strong>Base Application Fee</strong>
                                        <br />
                                        <span style={{ fontSize: '0.85rem', color: 'var(--cgwa-text-secondary)' }}>
                                            {formData.applicationType}
                                            {formData.isExemptMSME && ' (MSME Exempt - Reduced Fee)'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>{formatCurrency(fees.baseFee)}</td>
                                </tr>
                                <tr>
                                    <td>GST (18%)</td>
                                    <td style={{ textAlign: 'right' }}>{formatCurrency(fees.gstAmount)}</td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr style={{ background: 'var(--cgwa-primary)', color: 'white', fontWeight: 'bold' }}>
                                    <td>Total Amount</td>
                                    <td style={{ textAlign: 'right', fontSize: '1.2rem' }}>{formatCurrency(fees.totalAmount)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    )}
                </div>
            </div>

            {!paymentCompleted ? (
                <>
                    {/* Payment Method Selection */}
                    <div className="noc-card" style={{ marginBottom: '30px' }}>
                        <div className="noc-card-header">Select Payment Method</div>
                        <div className="noc-card-body">
                            <div className="noc-radio-group" style={{ flexDirection: 'row', gap: '30px' }}>
                                <div className="noc-radio-item">
                                    <input
                                        type="radio"
                                        id="payment-online"
                                        name="paymentMethod"
                                        value="online"
                                        checked={paymentMethod === 'online'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <label htmlFor="payment-online">
                                        <strong>Online Payment</strong>
                                        <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--cgwa-text-secondary)' }}>
                                            Pay using UPI, Net Banking, Debit/Credit Card
                                        </p>
                                    </label>
                                </div>
                                <div className="noc-radio-item">
                                    <input
                                        type="radio"
                                        id="payment-offline"
                                        name="paymentMethod"
                                        value="offline"
                                        checked={paymentMethod === 'offline'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <label htmlFor="payment-offline">
                                        <strong>Offline Payment</strong>
                                        <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--cgwa-text-secondary)' }}>
                                            Pay via bank challan or demand draft
                                        </p>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Instructions */}
                    <div className="noc-alert noc-alert-info" style={{ marginBottom: '20px' }}>
                        <p style={{ margin: 0 }}>
                            <strong>ℹ️ Payment Instructions:</strong>
                        </p>
                        <ul style={{ marginTop: '10px', marginBottom: 0 }}>
                            <li>After successful payment, a receipt will be generated</li>
                            <li>Download and save the receipt for your records</li>
                            <li>You will need to upload the receipt in the next step</li>
                            <li>Application can only be submitted after uploading payment receipt</li>
                        </ul>
                    </div>

                    {/* Proceed to Pay Button */}
                    <button
                        onClick={handlePayment}
                        disabled={processing}
                        className="noc-btn noc-btn-success noc-btn-block"
                        style={{ padding: '15px', fontSize: '1.1rem' }}
                    >
                        {processing ? (
                            <>
                                <span className="noc-spinner" style={{ display: 'inline-block', width: '20px', height: '20px', marginRight: '10px' }}></span>
                                Processing Payment...
                            </>
                        ) : (
                            `Proceed to Pay ${formatCurrency(fees.totalAmount)}`
                        )}
                    </button>
                </>
            ) : (
                /* Payment Success */
                <div className="noc-card" style={{ background: 'linear-gradient(135deg, #d4edda 0%, #c3f0ca 100%)', border: '2px solid var(--cgwa-success)' }}>
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '10px' }}>✅</div>
                        <h2 style={{ color: 'var(--cgwa-success)', margin: '0 0 10px 0' }}>Payment Successful!</h2>
                        <p style={{ marginBottom: '20px' }}>Your payment has been processed successfully.</p>

                        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'left' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <strong>Receipt Number:</strong>
                                    <p style={{ margin: '5px 0 0 0', color: 'var(--cgwa-primary)', fontSize: '1.1rem' }}>{receiptData.receiptNumber}</p>
                                </div>
                                <div>
                                    <strong>Transaction ID:</strong>
                                    <p style={{ margin: '5px 0 0 0', color: 'var(--cgwa-primary)', fontSize: '1.1rem' }}>{receiptData.transactionId}</p>
                                </div>
                                <div>
                                    <strong>Amount Paid:</strong>
                                    <p style={{ margin: '5px 0 0 0', color: 'var(--cgwa-success)', fontSize: '1.2rem', fontWeight: 'bold' }}>{formatCurrency(receiptData.amount)}</p>
                                </div>
                                <div>
                                    <strong>Payment Date:</strong>
                                    <p style={{ margin: '5px 0 0 0' }}>{receiptData.date}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={downloadReceipt}
                            className="noc-btn noc-btn-primary noc-btn-block"
                            style={{ padding: '12px', fontSize: '1.1rem' }}
                        >
                            📥 Download Payment Receipt (PDF)
                        </button>

                        <div className="noc-alert noc-alert-warning" style={{ marginTop: '20px', textAlign: 'left' }}>
                            <strong>⚠️ Important:</strong> Please download and save this receipt. You will need to upload it in the next step to complete your application submission.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentModule;
