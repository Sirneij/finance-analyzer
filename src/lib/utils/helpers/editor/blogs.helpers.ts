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

export const truncateSeriesArticles = (
	seriesArticles: Record<string, string>[],
	showAllSeries: boolean
) => {
	if (!showAllSeries && seriesArticles.length > 5) {
		const start = seriesArticles.slice(0, 2);
		const end = seriesArticles.slice(-2);
		const hidden = seriesArticles.length - 4;
		return [...start, { id: 'ellipsis', title: `${hidden} more parts` }, ...end];
	}
	return seriesArticles;
};
