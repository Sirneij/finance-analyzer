import type { IArticlePopulated } from '$lib/types/articles.types';
import { BASE_API_URI } from '$lib/utils/contants';
import { fail } from 'assert';
import type { Actions, PageServerLoad } from '../../[id]/$types';
import type { CustomError } from '$lib/types/errors.types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const articleResponse = await fetch(`${BASE_API_URI}/v1/articles/${params.id}`).then((res) =>
		res.json()
	);
	const article: IArticlePopulated = articleResponse.article;

	return {
		article
	};
};

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
