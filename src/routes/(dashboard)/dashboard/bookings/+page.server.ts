import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase }, parent, url }) => {
	const { profile } = await parent();

	if (!profile?.organization_id) {
		return { bookings: [] };
	}

	const status = url.searchParams.get('status');

	let query = supabase
		.from('bookings')
		.select(
			`
			*,
			service:services(name, color),
			staff:staff_members(user:users(full_name)),
			customer:users!bookings_customer_id_fkey(full_name, email)
		`
		)
		.eq('organization_id', profile.organization_id)
		.order('booking_date', { ascending: false })
		.order('start_time', { ascending: false });

	if (status) {
		query = query.eq('status', status);
	}

	const { data: bookings } = await query;

	return {
		bookings: bookings || []
	};
};
