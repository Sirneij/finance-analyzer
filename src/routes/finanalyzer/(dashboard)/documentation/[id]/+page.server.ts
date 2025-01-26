import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BASE_API_URI } from '$lib/utils/contants';
import type { Endpoint } from '$lib/types/docs.types';

export const load: PageServerLoad = async ({ fetch, locals, params }) => {
	// TODO: Only John should be able to access this page
	if (!locals.user) {
		throw redirect(302, '/finanalyzer/auth/login?next=/finanalyzer/documentation/' + params.id);
	}
	if (!locals.user.isJohn) {
		throw redirect(302, '/finanalyzer?message=You are not authorized to access this page');
	}

	const [doc, endpoints] = await Promise.all([
		fetch(`${BASE_API_URI}/v1/docs/endpoints/${params.id}`).then((res) => res.json()),
		fetch(`${BASE_API_URI}/docs`).then((res) => res.json())
	]);

	return {
		doc,
		endpoints: endpoints as Endpoint[]
	};
};
