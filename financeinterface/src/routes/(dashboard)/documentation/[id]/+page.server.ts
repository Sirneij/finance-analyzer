import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BASE_API_URI } from '$lib/utils/contants';

export const load: PageServerLoad = async ({ fetch, locals, params }) => {
	// TODO: Only admins should be able to access this page
	if (!locals.user) {
		throw redirect(302, '/auth/login?next=/documentation');
	}

	const [doc, endpoints] = await Promise.all([
		fetch(`${BASE_API_URI}/v1/docs/endpoints/${params.id}`).then((res) => res.json()),
		fetch(`${BASE_API_URI}/docs`).then((res) => res.json())
	]);

	return {
		doc,
		endpoints
	};
};
