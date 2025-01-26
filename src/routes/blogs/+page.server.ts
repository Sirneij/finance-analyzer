import type { IArticlePopulated } from '$lib/types/articles.types';
import { BASE_API_URI } from '$lib/utils/contants';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const page = Number(url.searchParams.get('page')) || 1;

	const [articleData, tagData] = await Promise.all([
		fetch(`${BASE_API_URI}/v1/articles?page=${page}`).then((res) => res.json()),
		fetch(`${BASE_API_URI}/v1/tags`).then((res) => res.json())
	]);

	return {
		articles: articleData.articles as IArticlePopulated[],
		metadata: articleData.metadata,
		tags: tagData.tags
	};
};
