interface DevToUser {
	user_id: number;
	name: string;
	username: string;
	twitter_username: string;
	github_username: string;
	website_url: string;
	profile_image: string;
	profile_image_90: string;
}

interface DevToOrganization {
	name: string;
	username: string;
	slug: string;
	profile_image: string;
	profile_image_90: string;
}

interface DevToFlareTag {
	name: string;
	bg_color_hex: string;
	text_color_hex: string;
}

export interface DevToArticle {
	type_of: string;
	id: number;
	title: string;
	description: string;
	cover_image: string;
	published: boolean;
	published_at: string;
	tag_list: string[];
	slug: string;
	path: string;
	url: string;
	canonical_url: string;
	comments_count: number;
	positive_reactions_count: number;
	public_reactions_count: number;
	page_views_count: number;
	published_timestamp: string;
	body_markdown: string;
	user: DevToUser;
	reading_time_minutes: number;
	organization: DevToOrganization;
	flare_tag: DevToFlareTag;
}

export interface SeriesDevToArticle extends DevToArticle {
	series: string;
	part: number | string;
}

export type ProcessedDevToArticles = {
	series: Record<string, SeriesDevToArticle[]>;
	standalone: DevToArticle[];
};

interface DevToCommentUser {
	user_id: number;
	name: string;
	username: string;
	twitter_username: string | null;
	github_username: string | null;
	website_url: string | null;
	profile_image: string;
	profile_image_90: string;
}

interface DevToComment {
	type_of: string;
	id_code: string;
	created_at: string;
	body_html: string;
	user: DevToCommentUser;
	children: DevToComment[];
}

interface DevToFollower {
	type_of: string;
	id: number;
	created_at: string;
	user_id: number;
	name: string;
	path: string;
	username: string;
	profile_image: string;
}

interface DevToFollowerCount {
	count: number;
	followers: DevToFollower[];
}

export type { DevToComment, DevToFollower, DevToFollowerCount };
