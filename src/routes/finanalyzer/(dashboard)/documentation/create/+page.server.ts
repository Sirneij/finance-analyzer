import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BASE_API_URI } from '$lib/utils/contants';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	// TODO: Only admins should be able to access this page
	if (!locals.user) {
		throw redirect(302, '/finanalyzer/auth/login?next=/finanalyzer/documentation/create');
	}
	const response = await fetch(`${BASE_API_URI}/docs`);

	const endpoints = await response.json();

	return {
		endpoints
	};
};
