import type { SupportedLanguage } from '$lib/types/docs.types';

export const BASE_API_URI = import.meta.env.DEV
	? import.meta.env.VITE_BASE_API_URI_DEV
	: import.meta.env.VITE_BASE_API_URI_PROD;

export const COLORS = {
	income: {
		chart: '#22C55E',
		background: 'bg-green-500'
	},
	expense: {
		chart: '#EF4444',
		background: 'bg-red-500'
	},
	savings: {
		chart: '#3B82F6',
		background: 'bg-blue-500'
	},
	balance: {
		chart: '#6B7280',
		background: 'bg-gray-500'
	}
};

export const LANGUAGES: SupportedLanguage[] = ['nodejs', 'python', 'go', 'rust'];
