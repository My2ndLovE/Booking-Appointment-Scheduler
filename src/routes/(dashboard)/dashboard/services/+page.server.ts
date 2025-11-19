import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase }, parent }) => {
	const { profile } = await parent();

	if (!profile?.organization_id) {
		return { services: [] };
	}

	const { data: services } = await supabase
		.from('services')
		.select('*, staff_services(count)')
		.eq('organization_id', profile.organization_id)
		.order('display_order');

	return {
		services: services || []
	};
};
