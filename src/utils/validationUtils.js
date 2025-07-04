export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validatePhone = (phone) => {
  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
  if (!phoneRegex.test(phone)) {
    return 'Please enter a valid phone number (xxx) xxx-xxxx';
  }
  return null;
};

export const validateNumber = (value, fieldName, min = 0, max = Infinity) => {
  const num = parseInt(value);
  if (isNaN(num)) {
    return `${fieldName} must be a number`;
  }
  if (num < min) {
    return `${fieldName} must be at least ${min}`;
  }
  if (num > max) {
    return `${fieldName} must be no more than ${max}`;
  }
  return null;
};

export const validateDate = (date, fieldName) => {
  if (!date) {
    return `${fieldName} is required`;
  }
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return `${fieldName} must be a valid date`;
  }
  
  return null;
};

export const validateFutureDate = (date, fieldName) => {
  const dateError = validateDate(date, fieldName);
  if (dateError) return dateError;
  
  const dateObj = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (dateObj < today) {
    return `${fieldName} must be a future date`;
  }
  
  return null;
};

export const validateLotNumber = (lotNumber) => {
  if (!lotNumber || lotNumber.trim() === '') {
    return 'Lot number is required';
  }
  
  if (lotNumber.length < 3) {
    return 'Lot number must be at least 3 characters';
  }
  
  const lotRegex = /^[A-Z0-9-]+$/;
  if (!lotRegex.test(lotNumber.toUpperCase())) {
    return 'Lot number can only contain letters, numbers, and hyphens';
  }
  
  return null;
};

export const validateQuantity = (quantity, available = null, fieldName = 'Quantity') => {
  const numberError = validateNumber(quantity, fieldName, 1);
  if (numberError) return numberError;
  
  const num = parseInt(quantity);
  if (available !== null && num > available) {
    return `${fieldName} cannot exceed available amount (${available})`;
  }
  
  return null;
};

export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = formData[field];
    
    for (const rule of rules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};