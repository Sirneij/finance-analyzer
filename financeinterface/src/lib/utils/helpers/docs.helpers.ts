import type { Endpoint, HttpMethod } from '$lib/types/docs.types';

export function groupEndpointsByCategory(endpoints: Endpoint[]): Record<string, Endpoint[]> {
	return endpoints.reduce(
		(acc, endpoint) => {
			const category = endpoint.path.split('/')[2] || 'other';
			if (!acc[category]) {
				acc[category] = [];
			}
			acc[category].push(endpoint);
			return acc;
		},
		{} as Record<string, Endpoint[]>
	);
}

export function getMethodColor(method: HttpMethod): string {
	const colors = {
		GET: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
		POST: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
		PUT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
		DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
	};
	return colors[method];
}

export function formatRange(num: number): string {
	const ranges = [
		{ value: 1e9, symbol: 'B' },
		{ value: 1e6, symbol: 'M' },
		{ value: 1e3, symbol: 'K' }
	];

	// Handle large numbers
	for (const range of ranges) {
		if (num >= range.value) {
			const scaled = num / range.value;
			const rounded = scaled >= 10 ? Math.floor(scaled) : Math.floor(scaled * 10) / 10;
			return `${rounded}${range.symbol}+`;
		}
	}

	// Handle smaller ranges
	if (num < 30) return '10+';
	if (num < 60) return '30+';
	if (num < 100) return '60+';

	// Handle hundreds (100+)
	const hundreds = Math.floor(num / 100) * 100;
	return `${hundreds}+`;
}
