import { format, toZonedTime, fromZonedTime } from 'date-fns-tz';

/**
 * Convert a date to a specific timezone
 */
export function toTimezone(date: Date, timezone: string): Date {
	return toZonedTime(date, timezone);
}

/**
 * Convert a date from a specific timezone to UTC
 */
export function toUTC(date: Date, timezone: string): Date {
	return fromZonedTime(date, timezone);
}

/**
 * Format a date in a specific timezone
 */
export function formatInTimezone(date: Date, timezone: string, formatStr: string): string {
	return format(toZonedTime(date, timezone), formatStr, { timeZone: timezone });
}

/**
 * Get current date in a specific timezone
 */
export function nowInTimezone(timezone: string): Date {
	return toZonedTime(new Date(), timezone);
}

/**
 * Combine date and time string in a specific timezone and convert to UTC
 */
export function combineDateTimeToUTC(
	date: Date,
	timeString: string,
	timezone: string
): Date {
	const [hours, minutes] = timeString.split(':').map(Number);
	const localDate = new Date(date);
	localDate.setHours(hours, minutes, 0, 0);

	return fromZonedTime(localDate, timezone);
}
