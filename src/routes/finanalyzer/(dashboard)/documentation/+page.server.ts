import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BASE_API_URI } from '$lib/utils/contants';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	// TODO: Only John should be able to access this page
	if (!locals.user) {
		throw redirect(302, '/finanalyzer/auth/login?next=/finanalyzer/documentation');
	}
	if (!locals.user.isJohn) {
		throw redirect(302, '/finanalyzer?message=You are not authorized to access this page');
	}

	const response = await fetch(`${BASE_API_URI}/v1/docs/endpoints`);
	if (!response.ok) {
		throw new Error('Failed to fetch data');
	}

	const data = await response.json();

	return {
		docs: data
	};
};

export const actions: Actions = {
	deleteEndpoint: async ({ fetch, request, cookies }) => {
		const data = await request.formData();
		const id = data.get('id') as string;

		const response = await fetch(`${BASE_API_URI}/v1/docs/endpoints/${id}`, {
			method: 'DELETE',
			headers: {
				Cookie: `connect.sid=${cookies.get('connect.sid')}`
			}
		});

		if (!response.ok) {
			throw new Error('Failed to delete endpoint');
		}

		return {
			success: true
		};
	}
};
