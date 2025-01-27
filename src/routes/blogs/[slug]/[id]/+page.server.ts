import { BASE_API_URI } from '$lib/utils/contants';
import { fail } from 'assert';
import type { CustomError } from '$lib/types/errors.types';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	deleteArticle: async ({ fetch, request, cookies }) => {
		const data = await request.formData();
		const articleId = data.get('article-id') as string;

		const apiURL = `${BASE_API_URI}/v1/articles/${articleId}`;

		const requestInitOptions: RequestInit = {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Cookie: `connect.sid=${cookies.get('connect.sid')}`
			}
		};

		const res = await fetch(apiURL, requestInitOptions);

		if (!res.ok) {
			const response = await res.json();
			const errors: Array<CustomError> = [];
			errors.push({ error: response.message, id: Math.floor(Math.random() * 100) });
			return fail(400, { errors });
		}

		throw redirect(302, '/blogs');
	}
};
