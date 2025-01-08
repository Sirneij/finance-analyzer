import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	// TODO: Only admins should be able to access this page
	if (!locals.user) {
		throw redirect(302, '/auth/login?next=/documentation');
	}
};
