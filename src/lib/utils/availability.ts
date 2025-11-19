import { supabase } from '$lib/supabase/client';
import type { WorkingHours, TimeSlot } from '$lib/types/staff';
import type { Booking } from '$lib/types/booking';
import { getDayName, timeToMinutes, minutesToTime, format } from './date';

/**
 * Generate time slots for a given time range
 */
export function generateTimeSlots(
	startTime: string,
	endTime: string,
	slotDuration: number,
	bufferMinutes: number = 0
): string[] {
	const slots: string[] = [];
	const startMinutes = timeToMinutes(startTime);
	const endMinutes = timeToMinutes(endTime);
	const totalSlotDuration = slotDuration + bufferMinutes;

	for (let minutes = startMinutes; minutes + slotDuration <= endMinutes; minutes += totalSlotDuration) {
		slots.push(minutesToTime(minutes));
	}

	return slots;
}

/**
 * Check if two time slots overlap
 */
export function slotsOverlap(
	start1: string,
	end1: string,
	start2: string,
	end2: string
): boolean {
	const start1Min = timeToMinutes(start1);
	const end1Min = timeToMinutes(end1);
	const start2Min = timeToMinutes(start2);
	const end2Min = timeToMinutes(end2);

	return start1Min < end2Min && end1Min > start2Min;
}

/**
 * Get working hours for a specific day
 */
export function getWorkingHoursForDay(
	workingHours: WorkingHours,
	date: Date
): TimeSlot[] | null {
	const dayName = getDayName(date);
	const dateStr = format(date, 'yyyy-MM-dd');

	// Check for exceptions first
	if (workingHours.exceptions && workingHours.exceptions[dateStr]) {
		const exception = workingHours.exceptions[dateStr];
		if (!exception.available) {
			return null;
		}
		if (exception.hours) {
			return exception.hours;
		}
	}

	// Return regular working hours
	return workingHours[dayName] || null;
}

/**
 * Get available time slots for a staff member on a specific date
 */
export async function getAvailableSlots(
	staffId: string,
	serviceId: string,
	date: Date,
	timezone: string = 'UTC'
): Promise<string[]> {
	try {
		// 1. Get service details
		const { data: service, error: serviceError } = await supabase
			.from('services')
			.select('duration_minutes, buffer_time_minutes')
			.eq('id', serviceId)
			.single();

		if (serviceError || !service) {
			console.error('Service not found:', serviceError);
			return [];
		}

		// 2. Get staff working hours
		const { data: staff, error: staffError } = await supabase
			.from('staff_members')
			.select('working_hours')
			.eq('id', staffId)
			.single();

		if (staffError || !staff) {
			console.error('Staff not found:', staffError);
			return [];
		}

		const workingHours = staff.working_hours as WorkingHours;
		const dayHours = getWorkingHoursForDay(workingHours, date);

		// No working hours for this day
		if (!dayHours || dayHours.length === 0) {
			return [];
		}

		// 3. Get existing bookings for this staff member on this date
		const dateStr = format(date, 'yyyy-MM-dd');
		const { data: bookings, error: bookingsError } = await supabase
			.from('bookings')
			.select('start_time, end_time')
			.eq('staff_id', staffId)
			.eq('booking_date', dateStr)
			.in('status', ['pending', 'confirmed']);

		if (bookingsError) {
			console.error('Error fetching bookings:', bookingsError);
			return [];
		}

		// 4. Generate all possible slots
		const allSlots: string[] = [];
		for (const timeSlot of dayHours) {
			const slots = generateTimeSlots(
				timeSlot.start,
				timeSlot.end,
				service.duration_minutes,
				service.buffer_time_minutes
			);
			allSlots.push(...slots);
		}

		// 5. Filter out booked slots
		const availableSlots = allSlots.filter((slotStart) => {
			const slotEnd = minutesToTime(
				timeToMinutes(slotStart) + service.duration_minutes
			);

			// Check if this slot conflicts with any existing booking
			const hasConflict = bookings?.some((booking: Booking) =>
				slotsOverlap(slotStart, slotEnd, booking.start_time, booking.end_time)
			);

			return !hasConflict;
		});

		return availableSlots.sort();
	} catch (error) {
		console.error('Error calculating availability:', error);
		return [];
	}
}

/**
 * Check if a specific time slot is available
 */
export async function isSlotAvailable(
	staffId: string,
	date: Date,
	startTime: string,
	endTime: string
): Promise<boolean> {
	const dateStr = format(date, 'yyyy-MM-dd');

	const { data: bookings, error } = await supabase
		.from('bookings')
		.select('start_time, end_time')
		.eq('staff_id', staffId)
		.eq('booking_date', dateStr)
		.in('status', ['pending', 'confirmed']);

	if (error) {
		console.error('Error checking slot availability:', error);
		return false;
	}

	const hasConflict = bookings?.some((booking: Booking) =>
		slotsOverlap(startTime, endTime, booking.start_time, booking.end_time)
	);

	return !hasConflict;
}
