import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BASE_API_URI } from '$lib/utils/contants';

export const load: PageServerLoad = async ({ fetch, locals, url }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login?next=/transactions');
	}

	const page = Number(url.searchParams.get('page')) || 1;
	const response = await fetch(`${BASE_API_URI}/v1/transactions?page=${page}`);

	const data = await response.json();

	return {
		transactions: data.data,
		metadata: data.metadata
	};
};
