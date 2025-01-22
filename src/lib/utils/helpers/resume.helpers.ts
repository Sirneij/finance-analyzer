import type { Resume } from '$lib/types/resume.types';
import { fetchWithTimeout, retryFetch } from './dev.to.helpers';

export const fetchResume = async () => {
	const resume = await retryFetch(async () => {
		const response = await fetchWithTimeout('/finanalyzer/api/about/resumes', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const data = await response.json();
		return data;
	});

	return resume as Resume;
};

const monthMap = {
	Jan: 0,
	Feb: 1,
	Mar: 2,
	Apr: 3,
	May: 4,
	Jun: 5,
	Jul: 6,
	Aug: 7,
	Sep: 8,
	Oct: 9,
	Nov: 10,
	Dec: 11
} as const;

export function parseEndDate(period: string): number {
	// ...existing code...
	const [_, end] = period.split(' - ');
	if (!end || /present/i.test(end)) return Number.MAX_SAFE_INTEGER;
	const [month, year] = end.replace('.', '').split(' ');
	return new Date(parseInt(year), monthMap[month as keyof typeof monthMap] ?? 0).getTime();
}

export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout;

	return function executedFunction(...args: Parameters<T>) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};

		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}
