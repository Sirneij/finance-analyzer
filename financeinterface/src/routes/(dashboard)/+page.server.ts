import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BASE_API_URI } from '$lib/utils/contants';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login');
	}

	const [transactions, summary] = await Promise.all([
		fetch(`${BASE_API_URI}/v1/transactions?limit=3`).then((res) => res.json()),
		fetch(`${BASE_API_URI}/v1/transactions/summary`).then((res) => res.json())
	]);

	return { transactions: transactions.data, summary };
};
