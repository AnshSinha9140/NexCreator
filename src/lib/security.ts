import { NextResponse } from "next/server";
import { Db } from "mongodb";

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}

/**
 * Standardized API Error Response Builder
 */
export function createApiErrorResponse(
  message: string,
  code: string = "BAD_REQUEST",
  status: number = 400
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    { status }
  );
}

/**
 * Standardized API Success Response Builder
 */
export function createApiSuccessResponse<T extends Record<string, any>>(
  data: T,
  status: number = 200
): NextResponse<{ success: true } & T> {
  return NextResponse.json(
    {
      success: true,
      ...data,
    },
    { status }
  );
}

/**
 * Strict Primitive Type Guard for NoSQL Query Injection Defense.
 * Rejects objects, arrays, and nested operator payloads (e.g. {$gt: ""}).
 */
export function ensureString(val: unknown, paramName: string = "Parameter"): string {
  if (val === null || val === undefined) {
    return "";
  }

  // Reject objects, arrays, and nested operator payloads
  if (typeof val === "object" || Array.isArray(val)) {
    throw new Error(`Invalid type for '${paramName}'. Objects and arrays are not permitted.`);
  }

  const str = String(val).trim();
  // Reject MongoDB operator strings starting with $
  if (str.startsWith("$")) {
    throw new Error(`Invalid input for '${paramName}'. Operators are not permitted.`);
  }

  return str;
}

/**
 * Sanitizes input values to prevent NoSQL query operator injection attacks
 */
export function sanitizeInputString(input: unknown): string {
  try {
    return ensureString(input);
  } catch (e) {
    return "";
  }
}

/**
 * Validates that a monitoring session exists and belongs to the authenticated user (IDOR Protection)
 */
export async function validateSessionOwnership(
  db: Db,
  sessionId: string,
  userEmail: string
): Promise<{ isValid: boolean; sessionDoc: any | null }> {
  const cleanSessionId = sanitizeInputString(sessionId);
  const cleanEmail = sanitizeInputString(userEmail);

  if (!cleanSessionId || !cleanEmail) {
    return { isValid: false, sessionDoc: null };
  }

  const sessionDoc = await db.collection("monitoring_sessions").findOne({
    id: cleanSessionId,
    userId: cleanEmail,
  });

  return {
    isValid: !!sessionDoc,
    sessionDoc,
  };
}

/**
 * Safe API Handler Wrapper.
 * Catches unhandled runtime exceptions and returns a safe standard error response without leaking stack traces or internal DB details.
 */
export function safeApiHandler(
  handler: (request: Request) => Promise<NextResponse>
): (request: Request) => Promise<NextResponse> {
  return async (request: Request) => {
    try {
      return await handler(request);
    } catch (error: any) {
      // Log detailed error internally for server debugging
      console.error(`[API Handler Error] ${request.method} ${request.url}:`, error);

      // Check if error is a known validation error
      if (error.message && error.message.includes("Invalid")) {
        return createApiErrorResponse(error.message, "INVALID_INPUT", 400);
      }

      // Safe production response: Never leak stack trace, filesystem path, or MongoDB error string
      return createApiErrorResponse(
        "An unexpected server error occurred. Please try again later.",
        "INTERNAL_SERVER_ERROR",
        500
      );
    }
  };
}
