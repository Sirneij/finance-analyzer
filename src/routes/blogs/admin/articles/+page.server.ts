import { BASE_API_URI } from '$lib/utils/contants';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';
import type { Actions } from './$types';
import type { CustomError } from '$lib/types/errors.types';

export const load: PageServerLoad = async ({ fetch }) => {
	const [articleData] = await Promise.all([
		fetch(`${BASE_API_URI}/v1/articles/all`).then((res) => res.json())
	]);

	return {
		articles: articleData.articles,
		metadata: { ...articleData.metadata, expanded: true }
	};
};

export const actions: Actions = {
	deleteArticles: async ({ fetch, request, cookies }) => {
		const formData = await request.formData();
		const articleIds = (formData.get('articleIds') as string).split(',');

		const apiURL = `${BASE_API_URI}/v1/articles/batch/delete`;

		const requestInitOptions: RequestInit = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Cookie: `connect.sid=${cookies.get('connect.sid')}`
			},
			body: JSON.stringify({ ids: articleIds })
		};

		const res = await fetch(apiURL, requestInitOptions);

		if (!res.ok) {
			const response = await res.json();
			const errors: Array<CustomError> = [];
			errors.push({ error: response.message, id: Math.floor(Math.random() * 100) });
			return fail(400, { errors: errors });
		}

		const response = await res.json();

		return { ...response };
	}
};
