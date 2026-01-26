/**
 * Password Validation Utility
 * Enforces strong password requirements
 */

export const validatePassword = (password) => {
  const errors = [];
  
  // Minimum length
  if (password.length < 8) {
    errors.push("at least 8 characters");
  }
  
  // Uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("one uppercase letter");
  }
  
  // Lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("one lowercase letter");
  }
  
  // Number
  if (!/[0-9]/.test(password)) {
    errors.push("one number");
  }
  
  // Special character
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push("one special character (!@#$%^&*...)");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    message: errors.length > 0 
      ? `Password must contain ${errors.join(", ")}`
      : "Password is strong"
  };
};

export const getPasswordStrength = (password) => {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) strength++;
  
  if (strength <= 2) return { level: "weak", color: "#f44336", text: "Weak" };
  if (strength <= 4) return { level: "medium", color: "#ff9800", text: "Medium" };
  return { level: "strong", color: "#4caf50", text: "Strong" };
};
