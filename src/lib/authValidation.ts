export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateSignup(input: {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.name || !input.name.trim()) {
    errors.name = "Full Name is required";
  }

  if (!input.email || !input.email.trim()) {
    errors.email = "Email address is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  if (!input.password) {
    errors.password = "Password is required";
  } else {
    if (input.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    } else if (!/[A-Z]/.test(input.password)) {
      errors.password = "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(input.password)) {
      errors.password = "Password must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(input.password)) {
      errors.password = "Password must contain at least one number";
    }
  }

  if (input.confirmPassword !== undefined && input.password !== input.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateLogin(input: {
  email?: string;
  password?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.email || !input.email.trim()) {
    errors.email = "Email address is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  if (!input.password) {
    errors.password = "Password is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
