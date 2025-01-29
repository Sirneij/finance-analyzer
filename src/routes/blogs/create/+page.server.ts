import type { CreateArticleInput, IArticle, IArticleSeries, ITag } from '$lib/types/articles.types';
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
	create: async ({ fetch, request, cookies }) => {
		const formData = await request.formData();
		// GET tags
		const tags = (formData.get('tags') as string).split(',');
		// GET series
		const series = formData.get('series') as string;
		// GET title
		const title = formData.get('title') as string;
		// GET content
		const content = formData.get('content') as string;
		// GET foreImage
		const foreImage = formData.get('foreImage') as string;
		// GET isPublished
		const isPublished = (formData.get('isPublished') as string)?.toLowerCase() === 'true';

		const createData: CreateArticleInput = {
			title,
			content,
			tags,
			foreImage,
			isPublished
		};

		if (series) {
			createData.series = series;
		}

		const apiURL = `${BASE_API_URI}/v1/articles`;

		const requestInitOptions: RequestInit = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Cookie: `connect.sid=${cookies.get('connect.sid')}`
			},
			body: JSON.stringify(createData)
		};

		const res = await fetch(apiURL, requestInitOptions);

		if (!res.ok) {
			const response = await res.json();
			const errors: Array<CustomError> = [];
			errors.push({ error: response.message, id: Math.floor(Math.random() * 100) });
			return fail(400, { errors: errors });
		}

		const response = await res.json();

		const article = response.article as IArticle;

		throw redirect(303, `/blogs/${article.slug}/${article._id}`);
	},
	savePostOptions: async ({ fetch, request, cookies }) => {
		const formData = await request.formData();
		const seriesTitle = formData.get('newseries-title') as string;

		// Validate input
		if (!seriesTitle?.trim()) {
			return fail(400, {
				errors: [{ error: 'Series title is required', id: Date.now() }]
			});
		}

		const data = [{ title: seriesTitle }];

		const apiURL = `${BASE_API_URI}/v1/series`;

		const requestInitOptions: RequestInit = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Cookie: `connect.sid=${cookies.get('connect.sid')}`
			},
			body: JSON.stringify(data)
		};

		const res = await fetch(apiURL, requestInitOptions);

		if (!res.ok) {
			const response = await res.json();
			const errors: Array<CustomError> = [];
			errors.push({ error: response.message, id: Math.floor(Math.random() * 100) });
			return fail(400, { errors: errors });
		}

		const response = await res.json();

		return response as { success: boolean; series: IArticleSeries };
	}
};
