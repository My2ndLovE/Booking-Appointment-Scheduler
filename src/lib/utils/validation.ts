import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters')
});

export const signupSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
	full_name: z.string().min(2, 'Name must be at least 2 characters'),
	phone: z.string().optional()
});

export const resetPasswordSchema = z.object({
	email: z.string().email('Invalid email address')
});

// Booking validation schemas
export const bookingSchema = z.object({
	customer_name: z.string().min(2, 'Name is required'),
	customer_email: z.string().email('Invalid email address'),
	customer_phone: z.string().optional(),
	notes: z.string().max(500, 'Notes must be less than 500 characters').optional()
});

// Service validation schemas
export const serviceSchema = z.object({
	name: z.string().min(2, 'Service name is required'),
	description: z.string().optional(),
	duration_minutes: z.number().min(15, 'Duration must be at least 15 minutes'),
	price: z.number().min(0, 'Price must be positive'),
	currency: z.string().default('USD'),
	color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').default('#3B82F6'),
	buffer_time_minutes: z.number().min(0).default(0),
	max_advance_booking_days: z.number().min(1).optional()
});

// Staff validation schemas
export const staffSchema = z.object({
	full_name: z.string().min(2, 'Name is required'),
	email: z.string().email('Invalid email address'),
	phone: z.string().optional(),
	title: z.string().optional(),
	bio: z.string().max(500).optional()
});

// Organization validation schemas
export const organizationSchema = z.object({
	slug: z
		.string()
		.min(3, 'Slug must be at least 3 characters')
		.max(50, 'Slug must be less than 50 characters')
		.regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
	name: z.string().min(2, 'Organization name is required'),
	description: z.string().optional(),
	email: z.string().email('Invalid email address'),
	phone: z.string().optional(),
	timezone: z.string().default('UTC')
});

// Helper function to parse validation errors
export function getFieldErrors(error: z.ZodError): Record<string, string> {
	const errors: Record<string, string> = {};
	error.errors.forEach((err) => {
		if (err.path) {
			errors[err.path.join('.')] = err.message;
		}
	});
	return errors;
}
