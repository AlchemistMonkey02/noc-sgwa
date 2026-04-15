import { useState, useEffect, useCallback } from 'react';
import nocApplicationService from '../services/nocApplicationService';

/**
 * Custom hook to fetch and manage master data for the NOC application.
 * Centralizes all master data fetching to avoid redundant API calls.
 */
export const useMasterData = () => {
    const [masterData, setMasterData] = useState({
        applicationTypes: [],
        applicationSubTypes: [],
        projectTypes: [],
        waterQualityTypes: [],
        utilizationPurposes: [],
        projectCategories: [],
        organizationTypes: [],
        msmeTypes: [],
        states: [],
        geologyTypes: [],
        meterTypes: [],
        sectorTypes: [],
        industryTypes: [],
        loading: true,
        error: null
    });

    const fetchAllMasterData = useCallback(async () => {
        setMasterData(prev => ({ ...prev, loading: true, error: null }));
        try {
            const [
                appTypes,
                waterQualities,
                purposes,
                categories,
                orgTypes,
                msme,
                statesRes,
                geology,
                meter,
                sector
            ] = await Promise.all([
                nocApplicationService.getApplicationTypes(),
                nocApplicationService.getWaterQualityTypes(),
                nocApplicationService.getUtilizationPurposes(),
                nocApplicationService.getProjectCategories(),
                nocApplicationService.getOrganizationTypes(),
                nocApplicationService.getMsmeTypes(),
                nocApplicationService.getStates(),
                nocApplicationService.getGeologyTypes(),
                nocApplicationService.getMeterTypes(),
                nocApplicationService.getSectorTypes()
            ]);

            setMasterData({
                applicationTypes: appTypes.data || [],
                waterQualityTypes: waterQualities.data || [],
                utilizationPurposes: purposes.data || [],
                projectCategories: categories.data || [],
                organizationTypes: orgTypes.data || [],
                msmeTypes: msme.data || [],
                states: statesRes.data || [],
                geologyTypes: geology.data || [],
                meterTypes: meter.data || [],
                sectorTypes: sector.data || [],
                // These are usually fetched conditionally
                applicationSubTypes: [],
                projectTypes: [],
                industryTypes: [],
                loading: false,
                error: null
            });
        } catch (err) {
            console.error("Failed to fetch master data:", err);
            setMasterData(prev => ({ 
                ...prev, 
                loading: false, 
                error: "Failed to load master data. Please try refreshing." 
            }));
        }
    }, []);

    useEffect(() => {
        fetchAllMasterData();
    }, [fetchAllMasterData]);

    // Helper to fetch conditional data
    const fetchSubTypes = useCallback(async (appTypeCode) => {
        try {
            const res = await nocApplicationService.getApplicationSubTypes(appTypeCode);
            return res.data || [];
        } catch (err) {
            console.error("Failed to fetch sub-types:", err);
            return [];
        }
    }, []);

    const fetchProjectTypes = useCallback(async (appSubTypeCode) => {
        try {
            const res = await nocApplicationService.getProjectTypes(appSubTypeCode);
            return res.data || [];
        } catch (err) {
            console.error("Failed to fetch project types:", err);
            return [];
        }
    }, []);

    const fetchIndustryTypes = useCallback(async (category) => {
        try {
            const res = await nocApplicationService.getIndustryTypes(category);
            return res.data || [];
        } catch (err) {
            console.error("Failed to fetch industry types:", err);
            return [];
        }
    }, []);

    return {
        ...masterData,
        refresh: fetchAllMasterData,
        fetchSubTypes,
        fetchProjectTypes,
        fetchIndustryTypes
    };
};

export default useMasterData;
