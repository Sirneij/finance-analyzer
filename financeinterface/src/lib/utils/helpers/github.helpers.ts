import type {
	BlogPost,
	GithubUserDetails,
	ProcessedBlogs,
	Repository,
	SeriesBlogPost,
	StandaloneBlogPost,
	UserData
} from '$lib/types/github.types';

import {
	GITHUB_AUTH_TOKEN,
	GITHUB_USERNAME,
	NAME_OF_TOOLS_ON_DEVICON_TO_EXCLUDE,
	NAME_OF_TOOLS_ON_DEVICON_TO_INCLUDE
} from '../contants';

const GITHUB_API_BASE = 'https://api.github.com';
const MAX_RETRIES = 3;
const TOP_REPOS_LIMIT = 10;

class GitHubAPIError extends Error {
	constructor(
		message: string,
		public status?: number
	) {
		super(message);
		this.name = 'GitHubAPIError';
	}
}

const createGitHubHeaders = (token: string): HeadersInit => ({
	'Content-Type': 'application/json',
	Authorization: `Bearer ${token}`,
	Accept: 'application/vnd.github+json'
});

async function fetchWithRetry(
	url: string,
	options: RequestInit,
	retries = MAX_RETRIES
): Promise<Response> {
	try {
		const response = await fetch(url, options);
		if (!response.ok) {
			if (response.status === 429 && retries > 0) {
				const retryAfter = parseInt(response.headers.get('Retry-After') || '5000');
				await new Promise((resolve) => setTimeout(resolve, retryAfter));
				return fetchWithRetry(url, options, retries - 1);
			}
			throw new GitHubAPIError(`GitHub API error: ${response.statusText}`, response.status);
		}
		return response;
	} catch (error) {
		console.error(`Error during fetch: ${url}`, error);
		if (retries > 0) return fetchWithRetry(url, options, retries - 1);
		throw error;
	}
}

async function fetchUserData(headers: HeadersInit): Promise<UserData> {
	const response = await fetchWithRetry(`${GITHUB_API_BASE}/users/${GITHUB_USERNAME}`, { headers });
	return response.json();
}

async function fetchRepositories(headers: HeadersInit): Promise<Repository[]> {
	const response = await fetchWithRetry(
		`${GITHUB_API_BASE}/user/repos?sort=updated&visibility=public`,
		{ headers }
	);
	const data = await response.json();
	if (!Array.isArray(data)) throw new GitHubAPIError('Repository data is not in expected format');
	return data;
}

async function fetchLanguages(repos: Repository[], headers: HeadersInit) {
	const languageMap = new Map<string, number>();

	await Promise.all(
		repos.map(async (repo) => {
			const response = await fetchWithRetry(repo.languages_url, { headers });
			const languages = await response.json();

			Object.entries(languages).forEach(([lang, bytes]) => {
				// Exclude languages in NAME_OF_TOOLS_ON_DEVICON_TO_EXCLUDE
				if (!NAME_OF_TOOLS_ON_DEVICON_TO_EXCLUDE.includes(lang.toLowerCase())) {
					languageMap.set(lang, (languageMap.get(lang) || 0) + (bytes as number));
				}
			});
		})
	);

	// If a language is a key in NAME_OF_TOOLS_ON_DEVICON_TO_INCLUDE, use its value instead
	for (const [lang, bytes] of languageMap.entries()) {
		const mappedLang =
			NAME_OF_TOOLS_ON_DEVICON_TO_INCLUDE[
				lang.toLowerCase() as keyof typeof NAME_OF_TOOLS_ON_DEVICON_TO_INCLUDE
			];

		if (mappedLang) {
			languageMap.set(mappedLang, (languageMap.get(mappedLang) || 0) + bytes);
			languageMap.delete(lang);
		}
	}

	return Array.from(languageMap.entries())
		.map(([name, bytes]) => ({
			name,
			bytes,
			icon: `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${name.toLowerCase()}/${name.toLowerCase()}-original.svg`
		}))
		.sort((a, b) => b.bytes - a.bytes);
}

async function fetchReadmeContent(headers: HeadersInit) {
	const response = await fetchWithRetry(
		`${GITHUB_API_BASE}/repos/${GITHUB_USERNAME}/${GITHUB_USERNAME}/readme`,
		{
			headers: { ...headers, Accept: 'application/vnd.github.raw' }
		}
	);
	return response.text();
}

export const getGithubDetails = async (): Promise<GithubUserDetails> => {
	if (!GITHUB_AUTH_TOKEN) throw new Error('GitHub token is required');

	const headers = createGitHubHeaders(GITHUB_AUTH_TOKEN);

	try {
		const [userData, reposData] = await Promise.all([
			fetchUserData(headers),
			fetchRepositories(headers)
		]);

		const topRepos = reposData
			.sort((a, b) => b.stargazers_count - a.stargazers_count)
			.slice(0, TOP_REPOS_LIMIT);

		const languages = await fetchLanguages(reposData, headers);
		const readmeContent = await fetchReadmeContent(headers);

		const bio =
			readmeContent
				.match(/---([\s\S]*?)---/)?.[1]
				?.trim()
				?.split('\n')?.[0] || '';
		const blogPostList =
			readmeContent.match(
				/<!-- BLOG-POST-LIST:START -->([\s\S]*?)<!-- BLOG-POST-LIST:END -->/
			)?.[1] || '';

		return {
			user: {
				name: userData.name,
				bio: userData.bio,
				location: userData.location,
				public_repos: userData.public_repos,
				followers: userData.followers,
				following: userData.following,
				avatar_url: userData.avatar_url
			},
			topRepos: topRepos.map((repo) => ({
				name: repo.name,
				description: repo.description,
				stargazers_count: repo.stargazers_count,
				forks_count: repo.forks_count,
				language: repo.language,
				html_url: repo.html_url
			})),
			languages,
			specialRepo: { bio, blogs: processBlogPosts(blogPostList) }
		};
	} catch (error) {
		console.error('Error fetching GitHub data:', error);
		throw error instanceof GitHubAPIError
			? error
			: new GitHubAPIError('Failed to fetch GitHub data');
	}
};

function processBlogPosts(blogPostList: string): ProcessedBlogs {
	const posts = blogPostList
		.split('\n')
		.filter((line) => line.trim().startsWith('-'))
		.map((line) => {
			const match = line.match(/\[(.*?)\]\((.*?)\)/);
			if (!match) return null;

			const [_, title, url] = match;
			const cleanTitle = title.replace(/&#39;/g, "'");
			const seriesMatch = title.match(/(.*?) - (Part (\d+)|.*)/);
			if (seriesMatch) {
				const seriesTitle = seriesMatch[1];
				const partMatch = seriesMatch[2].match(/Part (\d+)/);

				return {
					title: cleanTitle,
					url,
					series: seriesTitle,
					part: partMatch ? parseInt(partMatch[1]) : seriesMatch[2]
				} as SeriesBlogPost;
			}

			return {
				title: cleanTitle,
				url
			} as StandaloneBlogPost;
		})
		.filter((post): post is BlogPost => post !== null);

	const seriesMap = new Map<string, SeriesBlogPost[]>();
	const standalone: StandaloneBlogPost[] = [];

	posts.forEach((post) => {
		if ('series' in post) {
			if (!seriesMap.has(post.series)) {
				seriesMap.set(post.series, []);
			}
			seriesMap.get(post.series)?.push(post);
		} else {
			standalone.push(post);
		}
	});

	const series = Array.from(seriesMap.entries()).map(([name, posts]) => ({
		name,
		posts: posts.sort((a, b) => {
			if (isNumericPart(a.part) && isNumericPart(b.part)) {
				return b.part - a.part;
			}
			return String(a.part).localeCompare(String(b.part));
		})
	}));

	return { series, standalone };
}

function isNumericPart(part: number | string): part is number {
	return typeof part === 'number';
}
