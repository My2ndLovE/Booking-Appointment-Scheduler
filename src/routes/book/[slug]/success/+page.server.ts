import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
	const bookingId = url.searchParams.get('booking');

	if (!bookingId) {
		throw error(400, 'Booking ID is required');
	}

	const { data: booking, error: bookingError } = await supabase
		.from('bookings')
		.select(
			`
			*,
			service:services(*),
			staff:staff_members(*, user:users(*)),
			organization:organizations(*)
		`
		)
		.eq('id', bookingId)
		.single();

	if (bookingError || !booking) {
		throw error(404, 'Booking not found');
	}

	return {
		booking
	};
};
