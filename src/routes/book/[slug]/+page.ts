import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, locals: { supabase } }) => {
	const { slug } = params;

	// Load organization
	const { data: organization, error: orgError } = await supabase
		.from('organizations')
		.select('*')
		.eq('slug', slug)
		.eq('is_active', true)
		.single();

	if (orgError || !organization) {
		throw error(404, 'Organization not found');
	}

	// Load services with staff
	const { data: services, error: servicesError } = await supabase
		.from('services')
		.select(
			`
			*,
			staff_services(
				staff:staff_members(
					*,
					user:users(*)
				)
			)
		`
		)
		.eq('organization_id', organization.id)
		.eq('is_active', true)
		.order('display_order');

	if (servicesError) {
		console.error('Services error:', servicesError);
	}

	return {
		organization,
		services: services || []
	};
};
