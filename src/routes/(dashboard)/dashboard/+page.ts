import type { PageLoad } from './$types';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';

export const load: PageLoad = async ({ locals: { supabase }, parent }) => {
	const { profile } = await parent();

	if (!profile?.organization_id) {
		return {
			stats: null,
			recentBookings: []
		};
	}

	const now = new Date();
	const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
	const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');
	const weekStart = format(startOfWeek(now), 'yyyy-MM-dd');
	const weekEnd = format(endOfWeek(now), 'yyyy-MM-dd');
	const today = format(now, 'yyyy-MM-dd');

	// Get bookings for today
	const { data: todayBookings } = await supabase
		.from('bookings')
		.select('*')
		.eq('organization_id', profile.organization_id)
		.eq('booking_date', today)
		.in('status', ['pending', 'confirmed']);

	// Get bookings for this week
	const { data: weekBookings } = await supabase
		.from('bookings')
		.select('*')
		.eq('organization_id', profile.organization_id)
		.gte('booking_date', weekStart)
		.lte('booking_date', weekEnd);

	// Get bookings for this month
	const { data: monthBookings } = await supabase
		.from('bookings')
		.select('*')
		.eq('organization_id', profile.organization_id)
		.gte('booking_date', monthStart)
		.lte('booking_date', monthEnd);

	// Get total revenue (paid bookings)
	const { data: paidBookings } = await supabase
		.from('bookings')
		.select('price')
		.eq('organization_id', profile.organization_id)
		.eq('payment_status', 'paid')
		.gte('booking_date', monthStart)
		.lte('booking_date', monthEnd);

	const monthRevenue = paidBookings?.reduce((sum, b) => sum + Number(b.price), 0) || 0;

	// Get recent bookings
	const { data: recentBookings } = await supabase
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
		.order('created_at', { ascending: false })
		.limit(10);

	return {
		stats: {
			todayBookings: todayBookings?.length || 0,
			weekBookings: weekBookings?.length || 0,
			monthBookings: monthBookings?.length || 0,
			monthRevenue
		},
		recentBookings: recentBookings || []
	};
};
