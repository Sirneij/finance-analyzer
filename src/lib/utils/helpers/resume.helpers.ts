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
	const [, end] = period.split(' - ');
	if (!end || /present/i.test(end)) return Number.MAX_SAFE_INTEGER;
	const [month, year] = end.replace('.', '').split(' ');
	return new Date(parseInt(year), monthMap[month as keyof typeof monthMap] ?? 0).getTime();
}

type DebouncedFunction<T extends (...args: any[]) => any> = {
	(...args: Parameters<T>): ReturnType<T> | undefined;
	cancel: () => void;
	flush: () => ReturnType<T> | undefined;
};

export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number,
	options: { immediate?: boolean } = {}
): DebouncedFunction<T> {
	let timeout: NodeJS.Timeout | undefined;
	let result: ReturnType<T> | undefined;
	let lastArgs: Parameters<T> | undefined;
	let lastThis: any;

	function later() {
		timeout = undefined;
		if (!options.immediate && lastArgs) {
			result = func.apply(lastThis, lastArgs);
			lastArgs = lastThis = undefined;
		}
	}

	const debounced = function (this: any, ...args: Parameters<T>) {
		lastThis = this;
		lastArgs = args;

		if (timeout) {
			clearTimeout(timeout);
		}

		if (options.immediate && !timeout) {
			result = func.apply(this, args);
		}

		timeout = setTimeout(later, wait);
		return result;
	} as DebouncedFunction<T>;

	debounced.cancel = function () {
		if (timeout) {
			clearTimeout(timeout);
			timeout = undefined;
			lastArgs = lastThis = undefined;
		}
	};

	debounced.flush = function () {
		if (timeout && lastArgs) {
			clearTimeout(timeout);
			result = func.apply(lastThis, lastArgs);
			timeout = lastArgs = lastThis = undefined;
			return result;
		}
	};

	return debounced;
}
