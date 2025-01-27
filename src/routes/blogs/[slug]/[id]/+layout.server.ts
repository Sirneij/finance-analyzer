import type { IArticlePopulated } from '$lib/types/articles.types';
import { BASE_API_URI } from '$lib/utils/contants';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, fetch }) => {
	const articleResponse = await fetch(`${BASE_API_URI}/v1/articles/${params.id}`).then((res) =>
		res.json()
	);
	const article: IArticlePopulated = articleResponse.article;

	return {
		article
	};
};
