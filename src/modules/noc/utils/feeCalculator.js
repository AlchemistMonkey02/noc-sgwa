/**
 * Fee Calculator for NOC Applications
 * Fetches base fee from API - all users pay the same amount
 * NO calculations, NO GST, NO additional charges
 */

import nocApplicationService from '../services/nocApplicationService';

/**
 * Fetch base fee from API
 * @param {string} applicationId - Application ID
 * @returns {Promise<Object>} Fee details from API
 */
export const fetchBaseFee = async (applicationId) => {
    try {
        const response = await nocApplicationService.calculateFee({ applicationId });

        if (response.success && response.data) {
            // API returns the base fee amount
            const baseFee = response.data.baseFee || response.data.totalFee || 10000;

            return {
                baseFeePayable: baseFee,
                totalPayable: baseFee, // Same as base fee
                gst: 0,
                additionalCharges: 0,
                breakdown: {
                    baseFee: `₹${baseFee.toLocaleString('en-IN')}`,
                    gst: '₹0 (Not Applicable)',
                    totalPayable: `₹${baseFee.toLocaleString('en-IN')}`
                },
                displayMessage: 'Application Base Fee (Mandatory)',
                taxNote: 'No GST or additional charges applicable'
            };
        }

        // Fallback if API doesn't return data
        return {
            baseFeePayable: 10000,
            totalPayable: 10000,
            gst: 0,
            additionalCharges: 0,
            breakdown: {
                baseFee: '₹10,000',
                gst: '₹0 (Not Applicable)',
                totalPayable: '₹10,000'
            },
            displayMessage: 'Application Base Fee (Mandatory)',
            taxNote: 'No GST or additional charges applicable'
        };
    } catch (error) {
        console.error('Error fetching base fee:', error);
        // Return default fee on error
        return {
            baseFeePayable: 10000,
            totalPayable: 10000,
            gst: 0,
            additionalCharges: 0,
            breakdown: {
                baseFee: '₹10,000',
                gst: '₹0 (Not Applicable)',
                totalPayable: '₹10,000'
            },
            displayMessage: 'Application Base Fee (Mandatory)',
            taxNote: 'No GST or additional charges applicable',
            error: true
        };
    }
};

/**
 * Get fee summary for display
 * @param {string} applicationId
 * @returns {Promise<Object>}
 */
export const getFeeSummary = async (applicationId) => {
    return await fetchBaseFee(applicationId);
};
