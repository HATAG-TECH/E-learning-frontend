// Form validation utilities

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must include an uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must include a lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must include a number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must include a special character');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateUsername = (username) => {
    if (!username || username.length < 3) {
        return { isValid: false, error: 'Username must be at least 3 characters' };
    }
    if (username.length > 20) {
        return { isValid: false, error: 'Username must be less than 20 characters' };
    }
    return { isValid: true };
};

export const validateRequired = (value, fieldName = 'This field') => {
    if (!value || value.trim() === '') {
        return { isValid: false, error: `${fieldName} is required` };
    }
    return { isValid: true };
};
