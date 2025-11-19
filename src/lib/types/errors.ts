/**
 * Structured error types for the application
 */

export enum ErrorCode {
	// Authentication
	UNAUTHORIZED = 'UNAUTHORIZED',
	SESSION_EXPIRED = 'SESSION_EXPIRED',
	INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

	// Authorization
	FORBIDDEN = 'FORBIDDEN',
	INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

	// Validation
	VALIDATION_ERROR = 'VALIDATION_ERROR',
	INVALID_INPUT = 'INVALID_INPUT',
	MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

	// Resource
	NOT_FOUND = 'NOT_FOUND',
	ALREADY_EXISTS = 'ALREADY_EXISTS',
	CONFLICT = 'CONFLICT',

	// Business Logic
	BOOKING_UNAVAILABLE = 'BOOKING_UNAVAILABLE',
	TIME_SLOT_TAKEN = 'TIME_SLOT_TAKEN',
	PAST_DATE_NOT_ALLOWED = 'PAST_DATE_NOT_ALLOWED',
	BOOKING_WINDOW_EXCEEDED = 'BOOKING_WINDOW_EXCEEDED',

	// Network
	NETWORK_ERROR = 'NETWORK_ERROR',
	TIMEOUT = 'TIMEOUT',
	RATE_LIMITED = 'RATE_LIMITED',

	// Server
	INTERNAL_ERROR = 'INTERNAL_ERROR',
	DATABASE_ERROR = 'DATABASE_ERROR',
	EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

	// Generic
	UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class AppError extends Error {
	public readonly code: ErrorCode;
	public readonly statusCode: number;
	public readonly details?: Record<string, unknown>;
	public readonly timestamp: Date;

	constructor(
		message: string,
		code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
		statusCode: number = 500,
		details?: Record<string, unknown>
	) {
		super(message);
		this.name = 'AppError';
		this.code = code;
		this.statusCode = statusCode;
		this.details = details;
		this.timestamp = new Date();

		// Maintains proper stack trace for where error was thrown
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, AppError);
		}
	}

	toJSON() {
		return {
			name: this.name,
			message: this.message,
			code: this.code,
			statusCode: this.statusCode,
			details: this.details,
			timestamp: this.timestamp.toISOString()
		};
	}
}

/**
 * Factory functions for common errors
 */

export const Errors = {
	unauthorized(message = 'You are not authorized to perform this action'): AppError {
		return new AppError(message, ErrorCode.UNAUTHORIZED, 401);
	},

	forbidden(message = 'Access forbidden'): AppError {
		return new AppError(message, ErrorCode.FORBIDDEN, 403);
	},

	notFound(resource = 'Resource', id?: string): AppError {
		const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
		return new AppError(message, ErrorCode.NOT_FOUND, 404);
	},

	validation(message: string, details?: Record<string, unknown>): AppError {
		return new AppError(message, ErrorCode.VALIDATION_ERROR, 400, details);
	},

	conflict(message: string): AppError {
		return new AppError(message, ErrorCode.CONFLICT, 409);
	},

	network(message = 'Network error. Please check your connection.'): AppError {
		return new AppError(message, ErrorCode.NETWORK_ERROR, 0);
	},

	internal(message = 'An unexpected error occurred. Please try again later.'): AppError {
		return new AppError(message, ErrorCode.INTERNAL_ERROR, 500);
	},

	bookingUnavailable(reason?: string): AppError {
		const message = reason
			? `Booking unavailable: ${reason}`
			: 'This time slot is no longer available';
		return new AppError(message, ErrorCode.BOOKING_UNAVAILABLE, 409);
	},

	pastDate(): AppError {
		return new AppError(
			'Cannot book appointments for past dates',
			ErrorCode.PAST_DATE_NOT_ALLOWED,
			400
		);
	}
};

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
	return error instanceof AppError;
}

/**
 * Get user-friendly message from any error
 */
export function getErrorMessage(error: unknown): string {
	if (isAppError(error)) {
		return error.message;
	}

	if (error instanceof Error) {
		return error.message;
	}

	if (typeof error === 'string') {
		return error;
	}

	return 'An unexpected error occurred';
}

/**
 * Convert Supabase errors to AppErrors
 */
export function fromSupabaseError(error: any): AppError {
	const message = error?.message || 'Database operation failed';
	const code = error?.code;

	// Map Supabase error codes to our error codes
	switch (code) {
		case 'PGRST116': // Not found
		case '42P01': // Table doesn't exist
			return Errors.notFound('Resource');

		case '23505': // Unique violation
			return Errors.conflict('Resource already exists');

		case '23503': // Foreign key violation
			return Errors.validation('Invalid reference');

		case '42501': // Insufficient privilege
			return Errors.forbidden();

		case 'P0001': // raise_exception (custom RLS error)
			return Errors.unauthorized(message);

		default:
			return new AppError(message, ErrorCode.DATABASE_ERROR, 500, { originalCode: code });
	}
}

/**
 * Error logger (in production, send to monitoring service)
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
	if (import.meta.env.DEV) {
		console.error('[App Error]', {
			error: isAppError(error) ? error.toJSON() : error,
			context,
			stack: error instanceof Error ? error.stack : undefined
		});
	} else {
		// In production, send to monitoring service (e.g., Sentry)
		// sentry.captureException(error, { extra: context });
	}
}
