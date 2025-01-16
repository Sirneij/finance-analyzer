import type { ApiDoc } from '$lib/types/docs.types';
import { BASE_API_URI } from '$lib/utils/contants';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const response = await fetch(`${BASE_API_URI}/v1/docs/endpoints`);
	const docs: ApiDoc[] = await response.json();

	const categories = [...new Set(docs.map((doc) => doc.category))];
	const popularEndpoints = docs.slice(0, 4);

	return {
		docs,
		categories,
		popularEndpoints
	};
};
