import type { ApiDoc } from '$lib/types/docs.types';
import { BASE_API_URI } from '$lib/utils/contants';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const response = await fetch(`${BASE_API_URI}/v1/docs/endpoints`);
	const res = await response.json();
	const popularEndpoints = (res.endpoints as ApiDoc[]).slice(0, 4);

	return {
		docs: res.endpoints as ApiDoc[],
		popularEndpoints
	};
};
