import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ locals: { supabase, getSession } }) => {
	const session = await getSession();

	if (!session) {
		throw redirect(303, '/login');
	}

	// Get user profile
	const { data: profile } = await supabase
		.from('users')
		.select('*, organization:organizations(*)')
		.eq('id', session.user.id)
		.single();

	return {
		session,
		profile
	};
};
