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
		POST: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
		PUT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
		DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
	};
	return colors[method];
}
