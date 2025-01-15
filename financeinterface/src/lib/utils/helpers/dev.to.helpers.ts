import type {
	DevToArticle,
	DevToComment,
	DevToFollowerCount,
	ProcessedDevToArticles,
	SeriesDevToArticle
} from '$lib/types/dev.to.types';

const API_TIMEOUT = 10000; // 10 seconds
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

	try {
		const response = await fetch(url, {
			...options,
			signal: controller.signal
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return response;
	} finally {
		clearTimeout(timeout);
	}
}

async function retryFetch<T>(
	fetchFn: () => Promise<T>,
	attempts: number = RETRY_ATTEMPTS
): Promise<T> {
	for (let i = 0; i < attempts; i++) {
		try {
			return await fetchFn();
		} catch (error) {
			if (i === attempts - 1) throw error;
			await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * (i + 1)));
		}
	}
	throw new Error('Retry failed');
}

export async function fetchAndProcessDevToArticles(): Promise<ProcessedDevToArticles> {
	const articles = await retryFetch(async () => {
		const response = await fetchWithTimeout('/api/about/devto/articles', {
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const data = await response.json();
		if (!Array.isArray(data)) throw new Error('Invalid response format');
		return data as DevToArticle[];
	});

	const seriesMap = new Map<string, SeriesDevToArticle[]>();
	const standalone: DevToArticle[] = [];

	articles.forEach((article) => {
		const seriesMatch = article.title.match(/(.*?) - (Part (\d+)|.*)/i);

		if (seriesMatch) {
			const [, seriesTitle, , partNumber] = seriesMatch;
			const part = partNumber ? parseInt(partNumber, 10) : seriesMatch[2];

			const seriesArticle: SeriesDevToArticle = {
				...article,
				series: seriesTitle,
				part
			};

			seriesMap.set(seriesTitle, [...(seriesMap.get(seriesTitle) || []), seriesArticle]);
		} else {
			standalone.push(article);
		}
	});

	// Sort series articles by part number
	for (const articles of seriesMap.values()) {
		articles.sort((a, b) => {
			if (typeof a.part === 'number' && typeof b.part === 'number') {
				return a.part - b.part;
			}
			return String(a.part).localeCompare(String(b.part));
		});
	}

	return {
		series: Object.fromEntries(seriesMap),
		standalone
	};
}

export async function fetchArticleComments(articleId: number): Promise<DevToComment[]> {
	return retryFetch(async () => {
		const response = await fetchWithTimeout(`https://dev.to/api/comments?a_id=${articleId}`, {});
		const data = await response.json();
		if (!Array.isArray(data)) throw new Error('Invalid response format');
		return data;
	});
}

// Cache followers for 5 minutes
const FOLLOWERS_CACHE_DURATION = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

interface FollowersCache {
	data: DevToFollowerCount;
	timestamp: number;
}

function getFollowersFromCache(): FollowersCache | null {
	try {
		const cached = localStorage.getItem('devto_followers_cache');
		if (!cached) return null;

		const parsedCache: FollowersCache = JSON.parse(cached);
		if (Date.now() - parsedCache.timestamp > FOLLOWERS_CACHE_DURATION) {
			localStorage.removeItem('devto_followers_cache');
			return null;
		}

		return parsedCache;
	} catch {
		return null;
	}
}

export async function fetchFollowers(): Promise<DevToFollowerCount> {
	const cachedData = getFollowersFromCache();
	if (cachedData) return cachedData.data;

	const followers = await retryFetch(async () => {
		const response = await fetchWithTimeout('/api/about/devto/followers', {
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const data = await response.json();
		return data;
	});

	try {
		localStorage.setItem(
			'devto_followers_cache',
			JSON.stringify({
				data: followers,
				timestamp: Date.now()
			})
		);
	} catch (error) {
		console.warn('Failed to cache followers:', error);
	}

	return followers;
}

export const calculateTotalReactions = (articles: ProcessedDevToArticles) => {
	const seriesReactions = Object.values(articles.series)
		.flat()
		.reduce((total, article) => total + article.public_reactions_count, 0);

	const standaloneReactions = articles.standalone.reduce(
		(total, article) => total + article.public_reactions_count,
		0
	);

	return seriesReactions + standaloneReactions;
};

export const calculateTotalComments = (articles: ProcessedDevToArticles) => {
	const seriesComments = Object.values(articles.series)
		.flat()
		.reduce((total, article) => total + article.comments_count, 0);

	const standaloneComments = articles.standalone.reduce(
		(total, article) => total + article.comments_count,
		0
	);

	return seriesComments + standaloneComments;
};
