export interface IArticleSeries {
	_id: string;
	title: string;
	createdAt: string;
	updatedAt: string;
	__v: number;
}

export interface ITag {
	_id: string;
	name: string;
	description?: string;
	__v: number;
}

export interface IArticle {
	_id: string;
	__v: number;
	foreImage?: string;
	title: string;
	slug: string;
	content: string;
	isPublished: boolean;
	createdAt: string;
	updatedAt: string;
	language: string;
	series?: string;
	tags: string[];
}

export interface IArticlePopulated extends Omit<IArticle, 'series' | 'tags'> {
	series?: IArticleSeries;
	tags: ITag[];
}

export interface CreateArticleInput {
	foreImage?: string;
	title: string;
	slug: string;
	content: string;
	isPublished: boolean;
	series?: string;
	tags: string[];
}

export interface UpdateArticleInput {
	foreImage?: string;
	title?: string;
	slug?: string;
	content?: string;
	isPublished?: boolean;
	series?: string;
	tags?: string[];
}

export interface PaginatedArticles {
	articles: IArticlePopulated[];
	metadata: {
		total: number;
		page: number;
		limit: number;
	};
}

export interface CreateTagInput {
	name: string;
	description: string;
}

export interface UpdateTagInput {
	name?: string;
	description?: string;
}

export interface CreateArticleSeriesInput {
	title: string;
}
