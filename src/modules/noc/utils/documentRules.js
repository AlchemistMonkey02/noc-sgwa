
import { documentTypes } from './formData.js';

/**
 * Determines which documents are required based on the NOC application form data.
 * Implements logic for Project Type, Scale, Location, and Purpose.
 * 
 * @param {Object} formData - The full application form state
 * @returns {Array} - List of document objects (subset of documentTypes) with 'required' property set dynamically
 */
export const getRequiredDocuments = (formData) => {
    // 1. Identify Key Parameters
    const projectType = formData.groundWaterUtilizationFor || 'Industry';
    const subType = formData.applicationType; // e.g., 'Provisional NOC (New Project)'
    const isNewProject = formData.projectType === 'New Project' || formData.applicationType === 'Provisional NOC (New Project)';
    const waterDemand = parseFloat(formData.waterReqTotal || formData.waterReqFreshRequirement || 0); // KLD (assuming m3/day)
    const category = formData.blockCategory?.toLowerCase() || 'safe'; // SAFE, CRITICAL, OVER-EXPLOITED
    const hasExistingStructures = formData.existingStructures && formData.existingStructures.length > 0;
    const hasProposedStructures = (parseInt(formData.proposedBorewells || 0) + parseInt(formData.proposedTubewells || 0)) > 0;
    const isMining = projectType === 'Mining';
    const isInfrastructure = projectType === 'Infrastructure' || projectType === 'Commercial';
    const isIndustry = projectType === 'Industry';

    // Set of IDs to include
    let requiredDocIds = new Set();

    // --- 2. MANDATORY FOR ALL (Common Set) ---
    requiredDocIds.add('applicant_id_proof');
    requiredDocIds.add('land_ownership');
    requiredDocIds.add('site_plan');
    requiredDocIds.add('project_report');
    requiredDocIds.add('affidavit');
    // requiredDocIds.add('rainwater_plan'); // User said "Rainwater Harvesting Plan" for Common Set, we'll confirm
    requiredDocIds.add('rainwater_plan');
    // Water Source Details & Calculation is part of the form/DPR, but 'nabl_report' is usually good to have everywhere if gw involved.
    requiredDocIds.add('nabl_report');


    // --- 3. PROJECT TYPE BASED ---

    if (isIndustry) {
        requiredDocIds.add('dpr');
        requiredDocIds.add('industry_reg');
        requiredDocIds.add('water_balance');
        requiredDocIds.add('cto_cte'); // Almost always required for industry
        requiredDocIds.add('flow_meter_undertaking'); // Often required

        // ETP/STP - If they have ETP/STP capacity > 0
        if (parseFloat(formData.etpCapacity || 0) > 0 || parseFloat(formData.stpCapacity || 0) > 0) {
            requiredDocIds.add('etp_stp_details');
        }
    }

    if (formData.isMSME === 'Yes') {
        requiredDocIds.add('msme_certificate');
    }

    if (isInfrastructure) {
        requiredDocIds.add('building_plan');
        requiredDocIds.add('occupancy_cert'); // For existing
        requiredDocIds.add('fire_noc');

        if (parseFloat(formData.stpCapacity || 0) > 0) {
            requiredDocIds.add('etp_stp_details');
        }
    }

    if (isMining) {
        requiredDocIds.add('mining_permit');
        requiredDocIds.add('dewatering_plan');
        requiredDocIds.add('hydrogeological_report'); // Always for mining
    }

    if (projectType === 'Drinking/Domestic') {
        // Maybe just these?
        requiredDocIds.add('proof_residence');
        requiredDocIds.add('building_approval');
        // Domestic might skip some common ones? 
        // User said "Domestic / Individual Documents: Proof of Residence, Building Approval, Domestic Water Demand, Borewell Details"
        // "Documents Required for ALL" still applies?
        // User said "2️⃣ Documents Required for ALL Applications (Common Set)... These are mandatory everywhere, unless fully exempt."
        // If domestic is NOT exempt (e.g. > limit), they need NOC.
    }


    // --- 4. LOCATION / QUANTITY BASED ---

    // Over-exploited area or Critical -> Hydrogeological Report
    if (category.includes('over') || category.includes('critical')) {
        requiredDocIds.add('hydrogeological_report');
    }

    // Demand > 100 m3/day
    if (waterDemand > 100) {
        requiredDocIds.add('impact_assessment');
        requiredDocIds.add('gw_modelling');
    }

    // Existing Borewell -> Previous NOC
    // If they said "Existing Project" or "Expansion", or checked "Existing NOC"
    if (!isNewProject || formData.existingNOCStatus === 'Yes' || formData.projectStatus === 'Existing' || hasExistingStructures) {
        // Technically only if they had a previous NOC or are regularizing
        // User rule: "Existing borewell -> Previous NOC"
        // If they don't have one, maybe they shouldn't upload it, but let's ask if applicable.
        // Actually, if it's a new application for existing borewell (regularization), they might not have previous NOC.
        // But if they have "Existing NOC Status: Yes", then definitely include it.
        if (formData.existingNOCStatus === 'Yes') {
            requiredDocIds.add('previous_noc');
        }
    }

    // New Borewell -> Drilling Permission
    // If proposed structures > 0
    if (hasProposedStructures || isNewProject) {
        // Depends on state rules, but user listed "New borewell -> Drilling Permission"
        // Could be just "Proposed" status.
        requiredDocIds.add('drilling_permission');
    }

    // Environmental Clearance
    // If Industry and maybe pollinating or large? User said "Industrial project -> Environmental Clearance (if applicable)"
    // We'll add it as optional or conditionally required
    if (isIndustry) {
        requiredDocIds.add('ec_clearance');
    }


    // --- Filter and Return ---

    // Use the comprehensive list to filter objects
    return documentTypes.filter(doc => requiredDocIds.has(doc.id)).map(doc => ({
        ...doc,
        // We can override 'required' property here if needed, but for now we assume 
        // if it's in the list returned by this function, it IS required for this user's context.
        // Or we might want to mark some as optional within the context (e.g. Fire NOC only if high rise).
        // Since the rule engine is trying to be precise, we'll mark them as required.
        // Or we can rely on definition. But definition says "required: false" for DPR.
        // We should set `required: true` for the context-specific mandatory ones.
        required: true
    }));
};
