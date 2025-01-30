import type { IArticlePopulated, UploadApiResponse } from '$lib/types/articles.types';
import type { CustomError } from '$lib/types/errors.types';
import { BASE_API_URI } from '$lib/utils/contants';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const tagsPage = Number(url.searchParams.get('tagsPage')) || 1;

	const [articleData, tagData] = await Promise.all([
		fetch(`${BASE_API_URI}/v1/articles/search${url.search}`).then((res) => res.json()),
		fetch(`${BASE_API_URI}/v1/tags?page=${tagsPage}`).then((res) => res.json())
	]);

	return {
		articles: articleData.articles as IArticlePopulated[],
		articleMetadata: { ...articleData.metadata, expanded: true },
		tags: tagData.tags,
		tagsMetadata: { ...tagData.metadata, expanded: false }
	};
};

export const actions: Actions = {
	upload: async ({ fetch, request }) => {
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

		const apiURL = `${BASE_API_URI}/v1/articles/upload`;

		const requestInitOptions: RequestInit = {
			method: 'POST',
			body: formData
		};

		const res = await fetch(apiURL, requestInitOptions);

		if (!res.ok) {
			const response = await res.json();
			const errors: Array<CustomError> = [];
			errors.push({ error: response.message, id: Math.floor(Math.random() * 100) });
			return fail(400, { errors: errors });
		}

		const response = await res.json();

		return response as { success: boolean; uploadResult: UploadApiResponse };
	},

	deleteUpload: async ({ fetch, request }) => {
		const formData = await request.formData();
		const foreImageURL = formData.get('foreimage') as string;

		if (!foreImageURL) {
			const errors: Array<CustomError> = [];
			errors.push({
				id: Math.floor(Math.random() * 100),
				error: `Foreimage URL is required.`
			});
			return fail(400, { errors: errors });
		}

		const apiURL = `${BASE_API_URI}/v1/articles/delete-upload?url=${foreImageURL}`;

		const requestInitOptions: RequestInit = {
			method: 'DELETE'
		};

		const res = await fetch(apiURL, requestInitOptions);

		if (!res.ok) {
			const response = await res.json();
			const errors: Array<CustomError> = [];
			errors.push({ error: response.message, id: Math.floor(Math.random() * 100) });
			return fail(400, { errors: errors });
		}

		const response = await res.json();

		return {
			delete: true,
			...response
		};
	}
};
