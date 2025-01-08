import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BASE_API_URI } from '$lib/utils/contants';
import type { CustomError } from '$lib/types/errors.types';

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

export const actions: Actions = {
	deleteTransactions: async ({ fetch, request, cookies }) => {
		const data = await request.formData();
		const transactionData = data.get('transactions') as string;
		const transactions = transactionData.split(',');

		const apiURL = `${BASE_API_URI}/v1/transactions`;

		const requestInitOptions: RequestInit = {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Cookie: `connect.sid=${cookies.get('connect.sid')}`
			},
			body: JSON.stringify(transactions)
		};

		const res = await fetch(apiURL, requestInitOptions);

		if (!res.ok) {
			const response = await res.json();
			const errors: Array<CustomError> = [];
			errors.push({ error: response.error, id: Math.floor(Math.random() * 100) });
			return fail(400, { errors });
		}

		const response = await res.json();

		return {
			success: true,
			data: response
		};
	}
};
