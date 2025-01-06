import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BASE_API_URI } from '$lib/utils/contants';
import type { CustomError } from '$lib/types/errors.types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/auth/login?next=/behavior');
	}
};

export const actions: Actions = {
	upload: async ({ fetch, request, cookies }) => {
		const formData = await request.formData();
		const file = formData.get('file') as File;

		// Some validations
		const errors: Array<CustomError> = [];

		if (!file) {
			errors.push({
				id: Math.floor(Math.random() * 100),
				error: `An acceptable file is required. Ensure you upload a file.`
			});
		}
		if (errors.length > 0) {
			return fail(400, { errors: errors });
		}

		const apiURL = `${BASE_API_URI}/v1/transactions/upload`;

		const requestInitOptions: RequestInit = {
			method: 'POST',
			headers: {
				Cookie: `connect.sid=${cookies.get('connect.sid')}`
			},
			body: formData
		};

		const res = await fetch(apiURL, requestInitOptions);

		if (!res.ok) {
			const response = await res.json();
			const errors: Array<CustomError> = [];
			errors.push({ error: response.error, id: Math.floor(Math.random() * 100) });
			return fail(400, { errors: errors });
		}

		const response = await res.json();

		return {
			sucess: true,
			data: response
		};
	}
};
