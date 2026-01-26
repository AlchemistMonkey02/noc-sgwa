
import { getRequiredDocuments } from './documentRules.js';

console.log("🔍 Verifying Document Logic Rules...\n");

const scenarios = [
    {
        name: "🏭 Scenario 1: Industry (Standard)",
        data: {
            groundWaterUtilizationFor: 'Industry',
            applicationType: 'New Project',
            waterReqTotal: 50,
            blockCategory: 'Safe'
        },
        expectedIncludes: ['dpr', 'cto_cte', 'water_balance']
    },
    {
        name: "🏢 Scenario 2: Infrastructure (Hotel)",
        data: {
            groundWaterUtilizationFor: 'Infrastructure',
            applicationType: 'New Project',
            waterReqTotal: 20,
            blockCategory: 'Safe'
        },
        expectedIncludes: ['building_plan', 'occupancy_cert', 'fire_noc']
    },
    {
        name: "⛏️ Scenario 3: Mining (Critical Area)",
        data: {
            groundWaterUtilizationFor: 'Mining',
            blockCategory: 'Critical',
            waterReqTotal: 10
        },
        expectedIncludes: ['mining_permit', 'dewatering_plan', 'hydrogeological_report']
    },
    {
        name: "💧 Scenario 4: High Water Demand (>100 KLD)",
        data: {
            groundWaterUtilizationFor: 'Industry',
            waterReqTotal: 150, // > 100
            blockCategory: 'Safe'
        },
        expectedIncludes: ['impact_assessment', 'gw_modelling']
    },
    {
        name: "🌾 Scenario 5: Agriculture (Actually Exempt, but testing docs if applied)",
        data: {
            groundWaterUtilizationFor: 'Agriculture',
            blockCategory: 'Safe'
        },
        // Should NOT have Industry docs
        expectedExcludes: ['dpr', 'cto_cte']
    },
    {
        name: "🏭 Scenario 6: MSME Project",
        data: {
            groundWaterUtilizationFor: 'Industry',
            isMSME: 'Yes',
            blockCategory: 'Safe'
        },
        expectedIncludes: ['msme_certificate']
    },
    {
        name: "🔄 Scenario 7: Existing NOC Renewal/Expansion",
        data: {
            groundWaterUtilizationFor: 'Industry',
            existingNOCStatus: 'Yes',
            blockCategory: 'Safe'
        },
        expectedIncludes: ['previous_noc']
    }
];

scenarios.forEach(scenario => {
    console.log(`\n--- ${scenario.name} ---`);
    const docs = getRequiredDocuments(scenario.data);
    const docNames = docs.map(d => d.name);
    const docIds = docs.map(d => d.id);

    console.log(`👉 Required Documents (${docs.length}):`);
    docs.forEach(d => console.log(`   - [${d.id}] ${d.name}`));

    // Verification
    let pass = true;
    if (scenario.expectedIncludes) {
        scenario.expectedIncludes.forEach(id => {
            if (!docIds.includes(id)) {
                console.log(`❌ FAILED: Missing expected document '${id}'`);
                pass = false;
            }
        });
    }
    if (scenario.expectedExcludes) {
        scenario.expectedExcludes.forEach(id => {
            if (docIds.includes(id)) {
                console.log(`❌ FAILED: Found excluded document '${id}'`);
                pass = false;
            }
        });
    }

    if (pass) console.log("✅ SCENARIO PASSED");
});
