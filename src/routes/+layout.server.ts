import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ depends, locals }) => {
	depends('supabase:auth');

	const session = await locals.getSession();

	return {
		session
	};
};
