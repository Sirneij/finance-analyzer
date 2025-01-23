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
