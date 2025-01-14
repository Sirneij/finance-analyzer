/** GitHub user profile information */
export interface UserData {
	login: string;
	id: number;
	name: string;
	avatar_url: string;
	html_url: string;
	bio: string;
	location: string;
	email: string | null;
	public_repos: number;
	public_gists: number;
	followers: number;
	following: number;
	created_at: string;
	updated_at: string;
}

/** GitHub repository information */
export interface Repository {
	id: number;
	name: string;
	full_name: string;
	private: boolean;
	html_url: string;
	description: string | null;
	fork: boolean;
	created_at: string;
	updated_at: string;
	pushed_at: string;
	homepage: string | null;
	size: number;
	stargazers_count: number;
	watchers_count: number;
	language: string | null;
	forks_count: number;
	archived: boolean;
	disabled: boolean;
	license: {
		key: string;
		name: string;
		url: string;
	} | null;
	topics: string[];
	visibility: 'public' | 'private';
	default_branch: string;
	languages_url: string;
}

export interface GithubUserDetails {
	user: {
		name: string;
		bio: string;
		location: string;
		public_repos: number;
		followers: number;
		following: number;
		avatar_url: string;
	};
	topRepos: Array<{
		name: string;
		description: string | null;
		stargazers_count: number;
		forks_count: number;
		language: string | null;
		html_url: string;
	}>;
	languages: {
		name: any;
		bytes: any;
		icon: string;
	}[];
	specialRepo: {
		bio: string;
		blogs: ProcessedBlogs;
	};
}

export type SeriesBlogPost = {
	title: string;
	url: string;
	series: string;
	part: number | string;
};

export type StandaloneBlogPost = {
	title: string;
	url: string;
};

export type BlogPost = SeriesBlogPost | StandaloneBlogPost;

export type BlogSeries = {
	name: string;
	posts: SeriesBlogPost[];
};

export type ProcessedBlogs = {
	series: BlogSeries[];
	standalone: StandaloneBlogPost[];
};

export interface Testimonial {
	name: string;
	title?: string;
	text: string;
	image?: string;
	link?: string;
}
