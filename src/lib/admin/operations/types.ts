export interface OperationResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface AuditPayload {
  adminEmail: string;
  action: string;
  target: string;
  reason?: string;
  metadata?: Record<string, any>;
  ip?: string;
}

export interface OperationValidator {
  isValid: boolean;
  error?: string;
}
