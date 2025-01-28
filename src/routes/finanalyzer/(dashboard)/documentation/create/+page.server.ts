import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BASE_API_URI } from '$lib/utils/contants';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	if (!locals.user) {
		throw redirect(302, '/finanalyzer/auth/login?next=/finanalyzer/documentation');
	}
	if (!locals.user.isJohnOwolabiIdogun) {
		throw redirect(302, '/finanalyzer?message=You are not authorized to access this page');
	}
	const response = await fetch(`${BASE_API_URI}/docs`);

	const endpoints = await response.json();

	return {
		endpoints
	};
};