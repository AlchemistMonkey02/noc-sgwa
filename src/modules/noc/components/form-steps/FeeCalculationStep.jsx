import React from 'react';
import PaymentModule from '../PaymentModule';

/**
 * Fee Calculation Step Component
 * Displays the calculated fee and handles the payment trigger
 */
const FeeCalculationStep = ({
    formData,
    handlePaymentComplete
}) => {
    return (
        <div>
            <h3 className="form-section-header">Application Fee Calculation</h3>

            <div className="bhuneer-card" style={{ marginBottom: '20px', padding: '20px' }}>
                <h4>Fee Estimator</h4>
                <p>Applicable fees based on your application details:</p>

                {!formData.feeStructure ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                        <div className="spinner-border text-primary" role="status" style={{ marginRight: '10px' }}></div>
                        Calculating applicable fees...
                    </div>
                ) : (
                    <div className="noc-card" style={{ marginTop: '20px' }}>
                        <div className="noc-card-header">Fee Breakdown</div>
                        <div className="noc-card-body">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <strong>Application Base Fee:</strong> ₹{formData.feeStructure?.baseAmount?.toLocaleString('en-IN') || 0}
                                </div>
                                <div style={{ gridColumn: '1 / -1', borderTop: '2px solid #dee2e6', paddingTop: '15px', marginTop: '10px' }}>
                                    <strong style={{ fontSize: '1.2rem' }}>Total Payable Amount:</strong>{' '}
                                    <span style={{ fontSize: '1.3rem', color: 'var(--cgwa-success)', fontWeight: 'bold' }}>
                                        ₹{formData.feeStructure?.baseAmount?.toLocaleString('en-IN') || 0}
                                    </span>
                                    <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#666' }}>
                                        (Only Base Fee is applicable)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <PaymentModule
                formData={formData}
                onPaymentComplete={handlePaymentComplete}
            />
        </div>
    );
};

export default FeeCalculationStep;
