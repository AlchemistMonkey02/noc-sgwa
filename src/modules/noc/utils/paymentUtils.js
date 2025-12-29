// Payment calculation utilities for NOC Application

// Fee structure (in INR)
export const FEE_STRUCTURE = {
    applicationType: {
        'Fresh NOC': 5000,
        'NOC Renewal': 3000,
        'NOC Amendment': 2000,
        'NOC Transfer': 2500
    },
    msmeExempt: 500, // Reduced fee for MSME exempt applications
    gstRate: 0.18 // 18% GST
};

/**
 * Calculate application fee based on form data
 * @param {Object} formData - Application form data
 * @returns {Object} Fee breakdown
 */
export const calculateApplicationFee = (formData) => {
    let baseFee = 0;

    // Check if MSME exempt
    if (formData.isExemptMSME) {
        baseFee = FEE_STRUCTURE.msmeExempt;
    } else {
        // Calculate based on application type
        baseFee = FEE_STRUCTURE.applicationType[formData.applicationType] || 5000;
    }

    const gstAmount = baseFee * FEE_STRUCTURE.gstRate;
    const totalAmount = baseFee + gstAmount;

    return {
        baseFee,
        gstAmount: Math.round(gstAmount * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100
    };
};

/**
 * Generate unique receipt number
 * @returns {string} Receipt number
 */
export const generateReceiptNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    return `CGWA-${year}${month}-${random}`;
};

/**
 * Generate transaction ID
 * @returns {string} Transaction ID
 */
export const generateTransactionId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    return `TXN${timestamp}${random}`;
};

/**
 * Format currency in INR
 * @param {number} amount 
 * @returns {string} Formatted amount
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
};

/**
 * Format date for display
 * @param {Date} date 
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};
