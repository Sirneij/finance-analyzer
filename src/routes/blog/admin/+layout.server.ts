import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/finanalyzer/auth/login?next=/blog/admin');
	}
	if (!locals.user.isJohnOwolabiIdogun) {
		throw redirect(302, '/blog?message=You are not authorized to access this page');
	}
};
