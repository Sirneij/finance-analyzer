import type { IArticlePopulated } from '$lib/types/articles.types';
import { BASE_API_URI } from '$lib/utils/contants';
import { isBot } from '$lib/utils/helpers/editor/blogs.helpers';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, fetch, cookies, request }) => {
	let shouldCount = false;
	const userAgent = request.headers.get('user-agent') || '';

	// Don't count bot views
	if (!isBot(userAgent)) {
		const viewKey = `view_${params.id}`;
		const lastView = cookies.get(viewKey);
		const now = new Date();

		// Check if this is a new view (1-hour window)
		if (!lastView || now.getTime() - new Date(lastView).getTime() > 60 * 60 * 1000) {
			shouldCount = true;

			// Set cookie with 1-hour expiry
			const expires = new Date(now.getTime() + 60 * 60 * 1000);
			cookies.set(viewKey, now.toISOString(), {
				path: '/',
				expires,
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict'
			});
		}
	}

	const articleResponse = await fetch(
		`${BASE_API_URI}/v1/articles/${params.id}?views=${shouldCount ? 1 : 0}`
	).then((res) => res.json());

	return {
		article: articleResponse.article as IArticlePopulated
	};
};
