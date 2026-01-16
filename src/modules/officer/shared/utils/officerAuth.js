// Officer Authentication Utility

export const getOfficerToken = () => {
    return localStorage.getItem('officerToken');
};

export const setOfficerToken = (token) => {
    localStorage.setItem('officerToken', token);
};

export const getOfficerRole = () => {
    return localStorage.getItem('officerRole');
};

export const setOfficerRole = (role) => {
    localStorage.setItem('officerRole', role);
};

export const getOfficerData = () => {
    const data = localStorage.getItem('officerData');
    return data ? JSON.parse(data) : null;
};

export const setOfficerData = (data) => {
    localStorage.setItem('officerData', JSON.stringify(data));
};

export const clearOfficerAuth = () => {
    localStorage.removeItem('officerToken');
    localStorage.removeItem('officerRole');
    localStorage.removeItem('officerData');
};

export const isOfficerAuthenticated = () => {
    return !!getOfficerToken();
};

export const hasOfficerRole = (requiredRole) => {
    const role = getOfficerRole();
    if (Array.isArray(requiredRole)) {
        return requiredRole.includes(role);
    }
    return role === requiredRole;
};
