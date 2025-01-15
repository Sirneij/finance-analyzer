import Article from './Article.svelte';
import Comments from './Comments.svelte';
import Followers from './Followers.svelte';
import Hearts from './Hearts.svelte';
import Location from './Location.svelte';
import Repo from './Repo.svelte';

export const icons = {
	repo: Repo,
	followers: Followers,
	location: Location,
	articles: Article,
	reactions: Hearts,
	comments: Comments
} as const;
