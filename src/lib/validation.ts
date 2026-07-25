import { ensureString } from "./security";

export function validateQueryParam(
  requestUrl: string,
  paramName: string,
  required: boolean = false
): string {
  const { searchParams } = new URL(requestUrl);
  const raw = searchParams.get(paramName);

  if (!raw) {
    if (required) {
      throw new Error(`Query parameter '${paramName}' is required.`);
    }
    return "";
  }

  return ensureString(raw, paramName);
}

export function validateEnumParam<T extends string>(
  requestUrl: string,
  paramName: string,
  allowedValues: readonly T[],
  defaultValue?: T
): T {
  const val = validateQueryParam(requestUrl, paramName, false);
  if (!val) {
    if (defaultValue) return defaultValue;
    throw new Error(`Query parameter '${paramName}' is required.`);
  }

  if (!allowedValues.includes(val as T)) {
    throw new Error(
      `Invalid value '${val}' for parameter '${paramName}'. Allowed: ${allowedValues.join(", ")}`
    );
  }

  return val as T;
}

export function validateLoginPayload(body: any): {
  email: string;
  password: string;
  rememberMe: boolean;
} {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Invalid request body. JSON object expected.");
  }

  const email = ensureString(body.email, "email").toLowerCase();
  const password = ensureString(body.password, "password");
  const rememberMe = Boolean(body.rememberMe);

  if (!email) throw new Error("Email address is required.");
  if (!password) throw new Error("Password is required.");

  return { email, password, rememberMe };
}

export function validateSignupPayload(body: any): {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
} {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Invalid request body. JSON object expected.");
  }

  const name = ensureString(body.name, "name");
  const email = ensureString(body.email, "email").toLowerCase();
  const password = ensureString(body.password, "password");
  const confirmPassword = ensureString(body.confirmPassword, "confirmPassword");

  if (!name) throw new Error("Full name is required.");
  if (!email) throw new Error("Email address is required.");
  if (!password) throw new Error("Password is required.");
  if (!confirmPassword) throw new Error("Password confirmation is required.");

  return { name, email, password, confirmPassword };
}
