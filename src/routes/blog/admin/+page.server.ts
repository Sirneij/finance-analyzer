import type { CreateTagInput, IArticleSeries, ITag } from '$lib/types/articles.types';
import type { CustomError } from '$lib/types/errors.types';
import { BASE_API_URI } from '$lib/utils/contants';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const [tagData, seriesData, statsRes] = await Promise.all([
		fetch(`${BASE_API_URI}/v1/tags?page=1&limit=-1`).then((res) => res.json()),
		fetch(`${BASE_API_URI}/v1/series?page=1&limit=-1`).then((res) => res.json()),
		fetch(`${BASE_API_URI}/v1/articles/stats/metrics`).then((res) => res.json())
	]);

	return {
		tags: tagData.tags as ITag[],
		tagsMetadata: tagData.metadata,
		series: seriesData.series as IArticleSeries[],
		seriesMetadata: seriesData.metadata,
		stats: statsRes.stats || {}
	};
};

export const actions: Actions = {
	deleteTag: async ({ fetch, request }) => {
		const formData = await request.formData();
		const tagId = formData.get('tagId') as string;

		const apiURL = `${BASE_API_URI}/v1/tags/${tagId}`;

		const requestInitOptions: RequestInit = {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
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
	createTag: async ({ fetch, request }) => {
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
				'Content-Type': 'application/json'
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
	updateTag: async ({ fetch, request }) => {
		const data = await request.formData();
		const name = data.get('tagName') as string;
		const description = data.get('tagDescription') as string;
		const tagId = data.get('tagId') as string;

		const apiURL = `${BASE_API_URI}/v1/tags/${tagId}`;

		const requestInitOptions: RequestInit = {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
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
	},
	deleteSeries: async ({ request, fetch }) => {
		const formData = await request.formData();
		const ids = (formData.get('ids') as string).split(',');

		if (ids.length < 1) {
			const errors: Array<CustomError> = [];
			errors.push({ error: 'No series selected', id: Math.floor(Math.random() * 100) });
			return fail(400, { errors: errors });
		}

		// Prevent empty string from being sent from any of the ids
		if (ids.includes('')) {
			const errors: Array<CustomError> = [];
			errors.push({ error: 'Invalid series id', id: Math.floor(Math.random() * 100) });
			return fail(400, { errors: errors });
		}

		try {
			const res = await fetch(`${BASE_API_URI}/v1/series/batch/delete`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ids })
			});

			if (!res.ok) {
				const response = await res.json();
				const errors: Array<CustomError> = [];
				errors.push({ error: response.message, id: Math.floor(Math.random() * 100) });
				return fail(400, { errors: errors });
			}

			const response = await res.json();

			return { ...response };
		} catch (error) {
			return fail(500, { message: 'Failed to delete series' });
		}
	}
};
