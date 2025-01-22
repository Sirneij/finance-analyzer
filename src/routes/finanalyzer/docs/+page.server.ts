import type { ApiDoc } from '$lib/types/docs.types';
import { BASE_API_URI } from '$lib/utils/contants';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const response = await fetch(`${BASE_API_URI}/v1/docs/endpoints`);
	const docs: ApiDoc[] = await response.json();

	const categoryDocMappings = Array.from(
		docs
			.reduce((map, doc) => {
				if (!map.has(doc.category)) {
					map.set(doc.category, { category: doc.category, docId: doc._id });
				}
				return map;
			}, new Map())
			.values()
	);
	const popularEndpoints = docs.slice(0, 4);

	return {
		docs,
		categoryDocMappings,
		popularEndpoints
	};
};
