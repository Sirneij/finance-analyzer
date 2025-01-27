import type { IArticlePopulated } from '$lib/types/articles.types';
import { BASE_API_URI } from '$lib/utils/contants';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, fetch, cookies }) => {
	let views = 0;
	// if read-count-effective cookie item does not exist
	// if session time has expired
	if (cookies.get(`${params.id}`) === undefined) {
		views = 1;

		const dt = new Date();
		dt.setMinutes(dt.getMinutes() + 30);

		const session_id = crypto.randomUUID();
		cookies.set(`${params.id}`, session_id, { path: '/', expires: dt });
	}

	const articleResponse = await fetch(
		`${BASE_API_URI}/v1/articles/${params.id}?views=${views}`
	).then((res) => res.json());
	const article: IArticlePopulated = articleResponse.article;

	return {
		article
	};
};
