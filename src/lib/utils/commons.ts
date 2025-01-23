import { browser } from '$app/environment';

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
