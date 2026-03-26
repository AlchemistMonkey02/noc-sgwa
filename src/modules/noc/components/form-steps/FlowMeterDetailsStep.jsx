import React from 'react';
import FlowMeterCompliance from '../FlowMeterCompliance';

/**
 * Step 5: Water Meter Details Component (Optional)
 * Wraps FlowMeterCompliance into a step component
 */
const FlowMeterDetailsStep = ({
    formData,
    setFormData,
    meterManufacturers,
    meterModels,
    telemetryProviders,
    bisStandards,
    meterTypes,
    meterSerialNumbers
}) => {
    return (
        <div>
            <h3 className="form-section-header">Water Meter Details</h3>

            <div className="bhuneer-info-box" style={{ marginBottom: '30px' }}>
                <p><strong>Note:</strong> Since you have indicated that meters are installed on your groundwater structures, please provide the meter specifications below.</p>
            </div>

            <FlowMeterCompliance
                formData={formData}
                onUpdate={(data) => setFormData(prev => ({ ...prev, ...data }))}
                manufacturers={meterManufacturers}
                meterModels={meterModels}
                telemetryProviders={telemetryProviders}
                bisStandards={bisStandards}
                meterTypes={meterTypes}
                meterSerialNumbers={meterSerialNumbers}
            />
        </div>
    );
};

export default FlowMeterDetailsStep;
