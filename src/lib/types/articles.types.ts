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
	content: string;
	isPublished: boolean;
	series?: string;
	tags: string[];
}

export interface UpdateArticleInput {
	foreImage?: string;
	title?: string;
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

export interface UploadApiResponse {
	public_id: string;
	version: number;
	signature: string;
	width: number;
	height: number;
	format: string;
	resource_type: 'image' | 'video' | 'raw' | 'auto';
	created_at: string;
	tags: Array<string>;
	pages: number;
	bytes: number;
	type: string;
	etag: string;
	placeholder: boolean;
	url: string;
	secure_url: string;
	access_mode: string;
	original_filename: string;
	moderation: Array<string>;
	access_control: Array<string>;
	context: object;
	metadata: object;
	colors?: [string, number][];

	[futureKey: string]: any;
}

export interface NewITag {
	name: string;
	description: string;
}
export interface UpdateITag {
	name?: string;
	description?: string;
}

export interface TagInputState {
	selectedTags: ITag[];
}
