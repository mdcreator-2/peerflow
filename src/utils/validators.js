// Email Validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Campus Email Validation
export const isCampusEmail = (email, domain = 'nitp.ac.in') => {
  return email. toLowerCase().endsWith(`@${domain}`);
};

// Password Validation
export const isValidPassword = (password) => {
  // At least 6 characters
  return password.length >= 6;
};

export const getPasswordStrength = (password) => {
  let strength = 0;
  
  if (password. length >= 6) strength++;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  if (strength <= 2) return { level: 'weak', color: 'red', text: 'Weak' };
  if (strength <= 4) return { level: 'medium', color: 'yellow', text: 'Medium' };
  return { level: 'strong', color: 'green', text:  'Strong' };
};

// Phone Number Validation (Indian)
export const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex. test(phone. replace(/\s/g, ''));
};

// UPI ID Validation
export const isValidUPI = (upiId) => {
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
  return upiRegex.test(upiId);
};

// Price Validation
export const isValidPrice = (price) => {
  const numPrice = parseFloat(price);
  return !isNaN(numPrice) && numPrice > 0 && numPrice <= 1000000;
};

// Quantity Validation
export const isValidQuantity = (quantity) => {
  const numQty = parseInt(quantity);
  return !isNaN(numQty) && numQty > 0 && numQty <= 100;
};

// Text Length Validation
export const isValidLength = (text, min, max) => {
  const length = text?. trim().length || 0;
  return length >= min && length <= max;
};

// Product Form Validation
export const validateProductForm = (data) => {
  const errors = {};
  
  if (!isValidLength(data.title, 3, 100)) {
    errors.title = 'Title must be between 3 and 100 characters';
  }
  
  if (! isValidLength(data.description, 10, 1000)) {
    errors.description = 'Description must be between 10 and 1000 characters';
  }
  
  if (!data.category) {
    errors. category = 'Please select a category';
  }
  
  if (!isValidPrice(data.price)) {
    errors. price = 'Please enter a valid price (₹1 - ₹10,00,000)';
  }
  
  if (!isValidQuantity(data.quantity)) {
    errors.quantity = 'Please enter a valid quantity (1-100)';
  }
  
  if (!data.condition) {
    errors.condition = 'Please select the condition';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Skill Form Validation
export const validateSkillForm = (data) => {
  const errors = {};
  
  if (! isValidLength(data.skill_name, 2, 50)) {
    errors.skill_name = 'Skill name must be between 2 and 50 characters';
  }
  
  if (!isValidLength(data. description, 20, 500)) {
    errors.description = 'Description must be between 20 and 500 characters';
  }
  
  if (! data.category) {
    errors.category = 'Please select a category';
  }
  
  if (!data.proficiency_level) {
    errors.proficiency_level = 'Please select your proficiency level';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Signup Form Validation
export const validateSignupForm = (data) => {
  const errors = {};
  
  if (!isValidLength(data.displayName, 2, 50)) {
    errors.displayName = 'Name must be between 2 and 50 characters';
  }
  
  if (!isValidEmail(data.email)) {
    errors. email = 'Please enter a valid email address';
  }
  
  if (! isValidPassword(data.password)) {
    errors.password = 'Password must be at least 6 characters';
  }
  
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Checkout Form Validation
export const validateCheckoutForm = (data) => {
  const errors = {};
  
  if (!data.deliveryMethod) {
    errors.deliveryMethod = 'Please select a delivery method';
  }
  
  if (data.deliveryMethod === 'delivery') {
    if (!data.hostel) {
      errors.hostel = 'Please select your hostel';
    }
    if (! isValidPhone(data.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
  }
  
  if (! data.paymentMethod) {
    errors.paymentMethod = 'Please select a payment method';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};