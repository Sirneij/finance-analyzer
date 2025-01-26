import { browser } from '$app/environment';
import type { IArticlePopulated } from '$lib/types/articles.types';
import { WEBSITE_URL } from '$lib/utils/contants';

export const EDITOR_STORAGE_KEY = `${WEBSITE_URL}_editor_state`;

export interface EditorState {
	content: string;
	title: string;
	coverImage: string;
	selectedSeries: string;
	seriesName: string;
	tags: string[];
}

export const getEditorState = (): EditorState => {
	const state = localStorage.getItem(EDITOR_STORAGE_KEY);
	return state
		? JSON.parse(state)
		: {
				content: '',
				title: '',
				coverImage: '',
				selectedSeries: '',
				seriesName: '',
				tags: []
			};
};

export const setEditorState = (state: Partial<EditorState>) => {
	const currentState = getEditorState();
	localStorage.setItem(EDITOR_STORAGE_KEY, JSON.stringify({ ...currentState, ...state }));
};

type TOCItem = {
	level: number;
	text: string;
	id: string;
};

export const generateTOC = (content: string) => {
	// Split and clean content
	const lines = content
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);

	// Match h2 and h3 headings
	const headings = lines.filter((line) => {
		const isHeading = /^#{2,3}\s+\w+/.test(line);
		return isHeading;
	});

	return headings.map((heading): TOCItem => {
		const level = (heading.match(/^(#{2,3})/)?.[1] || '').length;
		const text = heading.replace(/^#{2,3}\s+/, '');

		return {
			level,
			text,
			id: text
				.toLowerCase()
				.trim()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/(^-|-$)/g, '')
		};
	});
};

export const estimateReadingTime = (content: string) => {
	const words = content.trim().split(/\s+/).length;
	const time = Math.ceil(words / 200); // Average reading speed
	return `${time} min read`;
};

interface IEllipsisArticle {
	_id: 'ellipsis';
	title: string;
}

export const truncateSeriesArticles = <T extends { _id: string; title: string }>(
	seriesArticles: T[],
	showAllSeries: boolean
): (T | IEllipsisArticle)[] => {
	if (!showAllSeries && seriesArticles.length > 5) {
		const start = seriesArticles.slice(0, 2);
		const end = seriesArticles.slice(-2);
		const hidden = seriesArticles.length - 4;
		const ellipsis: IEllipsisArticle = { _id: 'ellipsis', title: `${hidden} more parts` };
		return [...start, ellipsis, ...end];
	}
	return seriesArticles;
};

export const tocObserver = (setActiveId: (id: string) => void) => {
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					setActiveId(entry.target.id);
				}
			});
		},
		{
			rootMargin: '-20% 0px -80% 0px'
		}
	);
	return observer;
};

// Throttle scroll updates
export function throttle<T extends (...args: any[]) => any>(fn: T, wait: number) {
	let lastFn: number, lastTime: number;
	return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
		const now = Date.now();

		if (lastTime && now < lastTime + wait) {
			clearTimeout(lastFn);
			lastFn = window.setTimeout(() => {
				lastTime = now;
				fn.apply(this, args);
			}, wait);
			return undefined as any as ReturnType<T>;
		} else {
			lastTime = now;
			return fn.apply(this, args);
		}
	};
}

// Copy URL handler
export async function copyUrl(): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(window.location.href);
		return true;
	} catch (error) {
		console.error('Failed to copy URL:', error);
		return false;
	}
}

export async function shareContent(data: {
	title: string;
	text: string;
	url: string;
}): Promise<boolean> {
	if (!browser) return false;

	try {
		if (typeof navigator !== 'undefined' && navigator.share) {
			await navigator.share(data);
			return true;
		}

		// Fallback: Copy to clipboard
		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			const shareText = `${data.title}\n\n${data.text}\n\n${data.url}`;
			await navigator.clipboard.writeText(shareText);
			return true;
		}

		return false;
	} catch (error) {
		console.error('Failed to share:', error);
		return false;
	}
}

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export function formatArticleDate(date: string) {
	const articleDate = new Date(date);
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - articleDate.getTime()) / 1000);
	const month = articleDate.toLocaleString('default', { month: 'short' });
	const day = articleDate.getDate();
	const currentYear = now.getFullYear();
	const isCurrentYear = articleDate.getFullYear() === currentYear;

	let ago = '';

	// Calculate "ago" text for recent dates
	if (diffInSeconds < 60) {
		ago = `${diffInSeconds} seconds ago`;
	} else if (diffInSeconds < 3600) {
		const mins = Math.floor(diffInSeconds / 60);
		ago = `${mins} minute${mins === 1 ? '' : 's'} ago`;
	} else if (diffInSeconds < 86400) {
		const hours = Math.floor(diffInSeconds / 3600);
		ago = `${hours} hour${hours === 1 ? '' : 's'} ago`;
	} else if (diffInSeconds < 604800) {
		const days = Math.floor(diffInSeconds / 86400);
		ago = `${days} day${days === 1 ? '' : 's'} ago`;
	}

	// Format final date string
	if (ago) {
		return `${month} ${day} (${ago})`;
	}

	return isCurrentYear ? `${month} ${day}` : `${month} ${day}, ${articleDate.getFullYear()}`;
}
