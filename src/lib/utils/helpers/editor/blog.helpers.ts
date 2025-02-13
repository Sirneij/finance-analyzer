import { browser } from '$app/environment';
import type { IArticlePopulated, IArticleSeries } from '$lib/types/articles.types';
import { WEBSITE_URL } from '$lib/utils/contants';

export const EDITOR_STORAGE_KEY = `${WEBSITE_URL}_editor_state`;

export interface EditorState {
	content: string;
	title: string;
	foreImage: string;
	selectedSeries: string;
	tags: string[];
}

export const getEditorState = (): EditorState => {
	const state = localStorage.getItem(EDITOR_STORAGE_KEY);
	return state
		? JSON.parse(state)
		: { content: '', title: '', foreImage: '', selectedSeries: '', tags: [] };
};

export const setEditorState = (state: Partial<EditorState>) => {
	const currentState = getEditorState();
	localStorage.setItem(EDITOR_STORAGE_KEY, JSON.stringify({ ...currentState, ...state }));
};

type TOCItem = { level: number; text: string; id: string };

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
	slug: string;
}

export const truncateSeriesArticles = <T extends { _id: string; title: string; slug: string }>(
	seriesArticles: T[],
	showAllSeries: boolean
): (T | IEllipsisArticle)[] => {
	if (!showAllSeries && seriesArticles.length > 5) {
		const start = seriesArticles.slice(0, 2);
		const end = seriesArticles.slice(-2);
		const hidden = seriesArticles.length - 4;
		const ellipsis: IEllipsisArticle = { _id: 'ellipsis', title: `${hidden} more parts`, slug: '' };
		return [...start, ellipsis, ...end];
	}
	return seriesArticles;
};

export function truncateTitle(title: string, width?: number, maxLength?: number): string {
	// Use passed width or fallback to default
	const vw = width ?? 1024;

	const titleMaxLength =
		maxLength ??
		(vw >= 1440
			? 120 // Large desktop
			: vw >= 1024
				? 95 // Desktop
				: vw >= 768
					? 70 // Tablet
					: 50); // Mobile

	if (title.length <= titleMaxLength) {
		return title;
	}

	const splitPoint = Math.floor((titleMaxLength - 3) / 2);
	const start = title.substring(0, splitPoint);
	const end = title.substring(title.length - splitPoint);

	return `${start}...${end}`;
}

export const tocObserver = (setActiveId: (id: string) => void) => {
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					setActiveId(entry.target.id);
				}
			});
		},
		{ rootMargin: '-20% 0px -80% 0px' }
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

export const capitalize = (str: string) => {
	const abbreviations = ['ai', 'html', 'css', 'api', 'url', 'id']; // Add more as needed
	const articles = ['a', 'an', 'the'];

	const words = str.split(' ');
	const capitalizedWords = words.map((word, index) => {
		const lowerCaseWord = word.toLowerCase();

		if (abbreviations.includes(lowerCaseWord)) {
			return word.toUpperCase();
		}

		if (index > 0 && articles.includes(lowerCaseWord)) {
			return word;
		}

		// Handle hyphenated words
		if (word.includes('-')) {
			const hyphenatedParts = word.split('-');
			const capitalizedParts = hyphenatedParts.map((part) => {
				const lowerCasePart = part.toLowerCase();
				if (abbreviations.includes(lowerCasePart)) {
					return part.toUpperCase();
				}
				return part.charAt(0).toUpperCase() + part.slice(1);
			});
			return capitalizedParts.join('-');
		}

		return word.charAt(0).toUpperCase() + word.slice(1);
	});

	return capitalizedWords.join(' ');
};

const TIME_UNITS = {
	SECOND: { singular: 'sec', plural: 'secs' },
	MINUTE: { singular: 'min', plural: 'mins' },
	HOUR: { singular: 'hr', plural: 'hrs' },
	DAY: { singular: 'day', plural: 'days' }
} as const;

export function formatArticleDate(date: string, includeAgo = false): string {
	const articleDate = new Date(date);
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - articleDate.getTime()) / 1000);
	const month = articleDate.toLocaleString('default', { month: 'short' });
	const day = articleDate.getDate();
	const currentYear = now.getFullYear();
	const isCurrentYear = articleDate.getFullYear() === currentYear;

	let ago = '';

	// Calculate "ago" text for recent dates if includeAgo is true
	if (includeAgo) {
		if (diffInSeconds < 60) {
			ago = `${diffInSeconds} ${diffInSeconds === 1 ? TIME_UNITS.SECOND.singular : TIME_UNITS.SECOND.plural} ago`;
		} else if (diffInSeconds < 3600) {
			const mins = Math.floor(diffInSeconds / 60);
			ago = `${mins} ${mins === 1 ? TIME_UNITS.MINUTE.singular : TIME_UNITS.MINUTE.plural} ago`;
		} else if (diffInSeconds < 86400) {
			const hours = Math.floor(diffInSeconds / 3600);
			ago = `${hours} ${hours === 1 ? TIME_UNITS.HOUR.singular : TIME_UNITS.HOUR.plural} ago`;
		} else if (diffInSeconds < 604800) {
			const days = Math.floor(diffInSeconds / 86400);
			ago = `${days} ${days === 1 ? TIME_UNITS.DAY.singular : TIME_UNITS.DAY.plural} ago`;
		}
	}

	// Format final date string
	const baseDate = isCurrentYear
		? `${month} ${day}`
		: `${month} ${day}, ${articleDate.getFullYear()}`;
	return ago ? `${baseDate} (${ago})` : baseDate;
}

export const isBot = (userAgent: string): boolean => {
	const botPatterns = [
		'bot',
		'spider',
		'crawler',
		'wget',
		'curl',
		'Mozilla/5.0 (compatible; Googlebot',
		'Mozilla/5.0 (compatible; Bingbot',
		'Mozilla/5.0 (compatible; YandexBot',
		'Twitterbot'
	];

	return botPatterns.some((pattern) => userAgent.toLowerCase().includes(pattern.toLowerCase()));
};

export const formatSearchResponse = (
	params: URLSearchParams,
	seriesFromServer?: IArticleSeries[]
): string => {
	const parts: string[] = [];

	const q = params.get('q');
	if (q) parts.push(`search text: ${q}`);

	const tags = params.getAll('tags');
	if (tags.length) parts.push(`tags: [${tags.join(', ')}]`);

	const sortBy = params.get('sortBy');
	if (sortBy && sortBy !== 'recent') parts.push(`sortBy: ${sortBy}`);

	const period = params.get('period');
	if (period && period !== 'all') parts.push(`period: ${period}`);

	const series = params.get('series');
	if (series) {
		const seriesTitle = seriesFromServer?.find((s) => s._id === series)?.title;
		if (seriesTitle) parts.push(`series: ${seriesTitle}`);
	}

	return parts.join(', ');
};

export async function fetchSeriesArticles(seriesId: string): Promise<IArticlePopulated[]> {
	const res = await fetch(`/blog/api/series/${seriesId}`);
	const data = await res.json();
	return data.articles;
}

export function addScreenReaderLabels(rootElement: HTMLElement) {
	// Find all form elements that typically need labels
	const formElements = rootElement.querySelectorAll('input, select, textarea');

	formElements.forEach((element) => {
		// Check if element already has an associated label
		const id = element.getAttribute('id');
		const hasLabel = id
			? rootElement.querySelector(`label[for="${id}"]`)
			: element.closest('label');

		if (!hasLabel) {
			// Create label text from placeholder, name, or type
			const labelText =
				element.parentElement?.textContent ||
				element.getAttribute('placeholder') ||
				element.getAttribute('name') ||
				element.getAttribute('type') ||
				'Form field';

			// Create new label element
			const label = document.createElement('label');
			label.setAttribute('for', id || crypto.randomUUID());
			label.classList.add('sr-only');
			label.textContent = labelText;

			// If element didn't have an ID, add the generated one
			if (!id) {
				element.setAttribute('id', label.getAttribute('for')!);
			}

			// Insert label before the element
			element.insertAdjacentElement('beforebegin', label);
		}
	});
}
