// Condition Rules Engine
// Based on Annexure-14 and Gazette 2025

export const getConditions = (formData, blockCategory) => {
    const conditions = [];

    // --- 1. GENERAL CONDITIONS (ALL) ---
    conditions.push({
        code: 'GEN_01',
        text: 'Installation of tamper-proof digital water flow meter with telemetry on all abstraction structures is mandatory.',
        mandatory: true
    });
    conditions.push({
        code: 'GEN_02',
        text: 'The user shall pay groundwater extraction charges as per the rates fixed by the State Government.',
        mandatory: true
    });
    conditions.push({
        code: 'GEN_03',
        text: 'Annual water quality monitoring (once a year) from NABL accredited laboratory is mandatory.',
        mandatory: true
    });
    conditions.push({
        code: 'GEN_04',
        text: 'No treated/untreated wastewater shall be injected into the aquifer.',
        mandatory: true
    });

    // --- 2. INDUSTRY SPECIFIC ---
    if (formData.groundWaterUtilizationFor === 'Industry') {
        const isPolluting = formData.isPolluting || false; // This flag needs to come from Industry Classification

        conditions.push({
            code: 'IND_01',
            text: 'Monitoring of piezometer water levels shall be done monthly and data submitted online.',
            mandatory: true
        });

        if (isPolluting) {
            conditions.push({
                code: 'IND_POL_01',
                text: 'The industry being in Polluting category must implement Well-Head Protection to prevent groundwater contamination.',
                mandatory: true
            });
            conditions.push({
                code: 'IND_POL_02',
                text: 'Strict "Zero Liquid Discharge" (ZLD) conditions apply if mandated by PCB.',
                mandatory: true
            });
        }
    }

    // --- 3. MINING SPECIFIC ---
    if (formData.groundWaterUtilizationFor === 'Mining') {
        conditions.push({
            code: 'MIN_01',
            text: 'Piezometers must be installed in both Core Zone and Buffer Zone.',
            mandatory: true
        });
        conditions.push({
            code: 'MIN_02',
            text: 'The water pumped out during dewatering shall be treated and reused. It cannot be wasted.',
            mandatory: true
        });
        conditions.push({
            code: 'MIN_03',
            text: 'Maintenance of Environmental Flow (E-Flow) in nearby water bodies is mandatory.',
            mandatory: true
        });
    }

    // --- 4. AREA BASED RESTRICTIONS ---
    if (blockCategory === 'Over-Exploited') {
        conditions.push({
            code: 'OE_01',
            text: 'Strict withdrawal limits apply. Any increase in extraction is strictly prohibited.',
            mandatory: true
        });

        // Note: Packaged water ban is handled at application validation stage (auto-reject)
    }

    return conditions;
};
