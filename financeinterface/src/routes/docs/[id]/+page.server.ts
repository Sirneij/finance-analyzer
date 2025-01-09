import { BASE_API_URI } from '$lib/utils/contants';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	// Get all docs for sidebar
	const [docsResponse, currentDocResponse] = await Promise.all([
		fetch(`${BASE_API_URI}/v1/docs/endpoints`),
		fetch(`${BASE_API_URI}/v1/docs/endpoints/${params.id}`)
	]);

	const [docs, currentDoc] = await Promise.all([docsResponse.json(), currentDocResponse.json()]);

	return {
		docs,
		currentDoc
	};
};
