import { browser } from '$app/environment';
import { goto } from '$app/navigation';

let cachedOS: string | null = null;

export const normalizeKey = (key: string): string => {
	const keyMap: Record<string, string> = {
		Control: 'ctrl',
		Meta: 'cmd',
		Shift: 'shift',
		Alt: 'alt',
		Option: 'alt',
		AltGraph: 'alt'
	};

	return keyMap[key] || key.toLowerCase();
};

export const getModifierKey = () => {
	const os = detectOS();
	return os === 'mac' ? '⌘' : 'Ctrl';
};

export const getAltOrOption = () => {
	const os = detectOS();
	return os === 'mac' ? 'Option' : 'Alt';
};

export const detectOS = (): string => {
	if (!browser) return 'unknown';
	if (cachedOS) return cachedOS;

	try {
		// Use platform API first
		if (navigator.platform) {
			if (navigator.platform.indexOf('Win') !== -1) cachedOS = 'windows';
			if (navigator.platform.indexOf('Mac') !== -1) cachedOS = 'mac';
			if (navigator.platform.indexOf('Linux') !== -1) cachedOS = 'linux';
		}

		// Fallback to userAgent
		if (!cachedOS) {
			const userAgent = window.navigator.userAgent;
			if (userAgent.includes('Windows')) cachedOS = 'windows';
			else if (userAgent.includes('Mac')) cachedOS = 'mac';
			else if (userAgent.includes('Linux')) cachedOS = 'linux';
			else cachedOS = 'unknown';
		}
	} catch (error) {
		console.warn('OS detection failed:', error);
		cachedOS = 'unknown';
	}

	return cachedOS || 'unknown';
};

export function calculateVisiblePages(currentPage: number, total: number) {
	if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

	if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', total];
	if (currentPage >= total - 3)
		return [1, '...', total - 4, total - 3, total - 2, total - 1, total];

	return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', total];
}

export async function handlePageChange(newPage: number) {
	await goto(`?page=${newPage}`, { invalidateAll: true });
}
