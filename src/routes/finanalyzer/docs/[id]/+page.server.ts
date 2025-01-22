import { BASE_API_URI } from '$lib/utils/contants';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	// Get all docs for sidebar
	const [docs, currentDoc] = await Promise.all([
		fetch(`${BASE_API_URI}/v1/docs/endpoints`).then((res) => res.json()),
		fetch(`${BASE_API_URI}/v1/docs/endpoints/${params.id}`).then((res) => res.json())
	]);

	return {
		docs,
		currentDoc
	};
};
