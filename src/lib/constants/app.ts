/**
 * Application-wide constants
 */

// UI Constants
export const DEFAULT_COLOR = '#3B82F6';
export const TOAST_DURATION = 3000; // milliseconds
export const TOAST_ID_LENGTH = 7;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
export const BOOKINGS_PAGE_SIZE = 20;

// Booking Constants
export const MIN_BOOKING_ADVANCE_HOURS = 2;
export const MAX_BOOKING_ADVANCE_DAYS = 30;
export const DEFAULT_BUFFER_MINUTES = 15;
export const DEFAULT_SERVICE_DURATION = 60;

// Date & Time
export const DEFAULT_TIMEZONE = 'UTC';
export const TIME_SLOT_INTERVAL = 30; // minutes
export const BUSINESS_HOURS_START = '09:00';
export const BUSINESS_HOURS_END = '17:00';

// Currency
export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] as const;
export const DEFAULT_CURRENCY = 'USD';

// Service Colors (predefined palette)
export const SERVICE_COLORS = [
	'#3B82F6', // Blue
	'#10B981', // Green
	'#F59E0B', // Amber
	'#EF4444', // Red
	'#8B5CF6', // Purple
	'#EC4899', // Pink
	'#6366F1', // Indigo
	'#14B8A6' // Teal
] as const;

// Status Colors
export const STATUS_COLORS = {
	pending: '#F59E0B', // Amber
	confirmed: '#10B981', // Green
	cancelled: '#EF4444', // Red
	completed: '#6B7280', // Gray
	no_show: '#DC2626' // Dark Red
} as const;

// Validation
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_NAME_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_NOTES_LENGTH = 1000;

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

// Rate Limiting (for client-side)
export const API_CALL_DEBOUNCE_MS = 300;
export const SEARCH_DEBOUNCE_MS = 500;

// Real-time
export const REALTIME_RECONNECT_DELAY = 1000;
export const REALTIME_MAX_RETRIES = 5;

// Error Messages
export const ERROR_MESSAGES = {
	NETWORK_ERROR: 'Network error. Please check your connection.',
	UNAUTHORIZED: 'You are not authorized to perform this action.',
	NOT_FOUND: 'The requested resource was not found.',
	VALIDATION_ERROR: 'Please check your input and try again.',
	SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
	SESSION_EXPIRED: 'Your session has expired. Please log in again.'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
	BOOKING_CREATED: 'Booking created successfully!',
	BOOKING_UPDATED: 'Booking updated successfully!',
	BOOKING_CANCELLED: 'Booking cancelled successfully!',
	SERVICE_CREATED: 'Service created successfully!',
	SERVICE_UPDATED: 'Service updated successfully!',
	SERVICE_DELETED: 'Service deleted successfully!',
	PROFILE_UPDATED: 'Profile updated successfully!',
	PASSWORD_CHANGED: 'Password changed successfully!'
} as const;

// Regular Expressions
export const REGEX = {
	EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	PHONE: /^\+?[1-9]\d{1,14}$/,
	HEX_COLOR: /^#[0-9A-Fa-f]{6}$/,
	TIME_24H: /^([01]\d|2[0-3]):([0-5]\d)$/,
	SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
} as const;

// API Endpoints (if needed for custom endpoints)
export const API_ENDPOINTS = {
	BOOKINGS: '/api/bookings',
	SERVICES: '/api/services',
	STAFF: '/api/staff',
	AVAILABILITY: '/api/availability'
} as const;

// Chart Colors (for analytics)
export const CHART_COLORS = {
	primary: '#3B82F6',
	success: '#10B981',
	warning: '#F59E0B',
	danger: '#EF4444',
	info: '#06B6D4',
	secondary: '#8B5CF6'
} as const;

// Days of Week
export const DAYS_OF_WEEK = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday'
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];
export type ServiceColor = (typeof SERVICE_COLORS)[number];
