import {
	format,
	parseISO,
	addMinutes,
	startOfDay,
	endOfDay,
	startOfWeek,
	endOfWeek,
	startOfMonth,
	endOfMonth,
	eachDayOfInterval,
	isSameDay,
	isToday,
	isPast,
	isFuture,
	differenceInDays
} from 'date-fns';

export {
	format,
	parseISO,
	addMinutes,
	startOfDay,
	endOfDay,
	startOfWeek,
	endOfWeek,
	startOfMonth,
	endOfMonth,
	eachDayOfInterval,
	isSameDay,
	isToday,
	isPast,
	isFuture,
	differenceInDays
};

/**
 * Format a date for display
 */
export function formatDate(date: Date | string, formatStr: string = 'PPP'): string {
	const d = typeof date === 'string' ? parseISO(date) : date;
	return format(d, formatStr);
}

/**
 * Format time from HH:mm to display format
 */
export function formatTime(time: string): string {
	const [hours, minutes] = time.split(':').map(Number);
	const period = hours >= 12 ? 'PM' : 'AM';
	const displayHours = hours % 12 || 12;
	return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Convert time string to minutes since midnight
 */
export function timeToMinutes(time: string): number {
	const [hours, minutes] = time.split(':').map(Number);
	return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string
 */
export function minutesToTime(minutes: number): string {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Calculate end time given start time and duration
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
	const startMinutes = timeToMinutes(startTime);
	const endMinutes = startMinutes + durationMinutes;
	return minutesToTime(endMinutes);
}

/**
 * Get day name from date
 */
export function getDayName(date: Date): string {
	return format(date, 'EEEE').toLowerCase() as
		| 'monday'
		| 'tuesday'
		| 'wednesday'
		| 'thursday'
		| 'friday'
		| 'saturday'
		| 'sunday';
}

/**
 * Check if a date is within min/max advance booking days
 */
export function isWithinBookingWindow(
	date: Date,
	minHours: number = 2,
	maxDays: number = 30
): boolean {
	const now = new Date();
	const diffDays = differenceInDays(date, now);
	const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

	return diffHours >= minHours && diffDays <= maxDays;
}
