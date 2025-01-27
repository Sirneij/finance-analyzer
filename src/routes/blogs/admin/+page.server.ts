import type { CreateTagInput, IArticleSeries, ITag } from '$lib/types/articles.types';
import type { CustomError } from '$lib/types/errors.types';
import { BASE_API_URI } from '$lib/utils/contants';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, locals }) => {
	if (!locals.user) {
		throw redirect(302, '/finanalyzer/auth/login?next=/finanalyzer/documentation');
	}
	if (!locals.user.isJohnOwolabiIdogun) {
		throw redirect(302, '/blogs?message=You are not authorized to access this page');
	}
	const [tagData, seriesData] = await Promise.all([
		fetch(`${BASE_API_URI}/v1/tags?page=1&limit=-1`).then((res) => res.json()),
		fetch(`${BASE_API_URI}/v1/series?page=1&limit=-1`).then((res) => res.json())
	]);

	return {
		tags: tagData.tags as ITag[],
		series: seriesData.series as IArticleSeries[]
	};
};

export const actions: Actions = {
	deleteTag: async ({ fetch, request, cookies }) => {
		const formData = await request.formData();
		const tagId = formData.get('tagId') as string;

		const apiURL = `${BASE_API_URI}/v1/tags/${tagId}`;

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
			return fail(400, { errors: errors });
		}

		return {
			status: res.status,
			deleted: true
		};
	},
	createTag: async ({ fetch, request, cookies }) => {
		const data = await request.formData();
		const tags: CreateTagInput[] = [];

		// Extract tags from FormData
		for (let i = 0; ; i++) {
			const name = data.get(`tags[${i}][name]`) as string;
			if (!name) break;

			tags.push({
				name,
				description: data.get(`tags[${i}][description]`) as string
			});
		}

		const apiURL = `${BASE_API_URI}/v1/tags`;

		const requestInitOptions: RequestInit = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Cookie: `connect.sid=${cookies.get('connect.sid')}`
			},
			body: JSON.stringify(tags)
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
	},
	updateTag: async ({ fetch, request, cookies }) => {
		const data = await request.formData();
		const name = data.get('tagName') as string;
		const description = data.get('tagDescription') as string;
		const tagId = data.get('tagId') as string;

		const apiURL = `${BASE_API_URI}/v1/tags/${tagId}`;

		const requestInitOptions: RequestInit = {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Cookie: `connect.sid=${cookies.get('connect.sid')}`
			},
			body: JSON.stringify({ name, description })
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
