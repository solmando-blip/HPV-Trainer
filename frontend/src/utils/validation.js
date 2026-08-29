// Validierungsfunktionen
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

export const validatePhoneNumber = (phone) => {
  // Optional: Basic phone validation
  return !phone || phone.replace(/\D/g, '').length >= 10;
};

export const getPasswordStrength = (password) => {
  if (!password) return 'weak';
  if (password.length < 6) return 'weak';
  if (password.length < 8) return 'medium';
  if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
    return 'strong';
  }
  return 'medium';
};

export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];
    
    if (rule.required && (!value || value.trim() === '')) {
      errors[field] = `${field} ist erforderlich.`;
    } else if (rule.type === 'email' && value && !validateEmail(value)) {
      errors[field] = 'Ungültige E-Mail-Adresse.';
    } else if (rule.type === 'password' && value && !validatePassword(value)) {
      errors[field] = 'Passwort muss mindestens 6 Zeichen lang sein.';
    } else if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = `${field} muss mindestens ${rule.minLength} Zeichen lang sein.`;
    } else if (rule.maxLength && value && value.length > rule.maxLength) {
      errors[field] = `${field} darf maximal ${rule.maxLength} Zeichen lang sein.`;
    } else if (rule.pattern && value && !rule.pattern.test(value)) {
      errors[field] = rule.patternMessage || `${field} hat ungültiges Format.`;
    }
  });
  
  return errors;
};
