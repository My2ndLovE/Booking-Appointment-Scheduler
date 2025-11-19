import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ depends, locals }) => {
	depends('supabase:auth');

	const session = await locals.getSession();

	return {
		session
	};
};
