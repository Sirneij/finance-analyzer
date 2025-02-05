import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	normalizeKey,
	getModifierKey,
	getAltOrOption,
	detectOS,
	calculateVisiblePages,
	handlePageChange
} from '$lib/utils/commons';
import { goto } from '$app/navigation';

vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

vi.mock('$app/environment', () => ({
	browser: true
}));

describe('normalizeKey', () => {
	it('normalizes modifier keys correctly', () => {
		expect(normalizeKey('Control')).toBe('ctrl');
		expect(normalizeKey('Meta')).toBe('cmd');
		expect(normalizeKey('Shift')).toBe('shift');
		expect(normalizeKey('Alt')).toBe('alt');
		expect(normalizeKey('Option')).toBe('alt');
		expect(normalizeKey('AltGraph')).toBe('alt');
	});

	it('converts unknown keys to lowercase', () => {
		expect(normalizeKey('Enter')).toBe('enter');
		expect(normalizeKey('Escape')).toBe('escape');
	});
});

describe('OS detection and related functions', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('detects Mac correctly', () => {
		vi.stubGlobal('navigator', {
			platform: 'MacIntel',
			userAgent: 'Macintosh'
		});
		expect(detectOS()).toBe('mac');
	});

	it('returns correct modifier key for different OS', () => {
		vi.stubGlobal('navigator', {
			platform: 'MacIntel'
		});
		expect(getModifierKey()).toBe('⌘');

		vi.stubGlobal('navigator', {
			platform: 'Win'
		});
		expect(getModifierKey()).toBe('Ctrl');
	});

	it('returns correct alt/option text for different OS', () => {
		vi.stubGlobal('navigator', {
			platform: 'MacIntel'
		});
		expect(getAltOrOption()).toBe('Option');

		vi.stubGlobal('navigator', {
			platform: 'Win'
		});
		expect(getAltOrOption()).toBe('Alt');
	});
});

describe('calculateVisiblePages', () => {
	it('returns all pages when total is 7 or less', () => {
		expect(calculateVisiblePages(1, 5)).toEqual([1, 2, 3, 4, 5]);
		expect(calculateVisiblePages(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
	});

	it('handles current page near start', () => {
		expect(calculateVisiblePages(1, 10)).toEqual([1, 2, 3, 4, 5, '...', 10]);
		expect(calculateVisiblePages(3, 10)).toEqual([1, 2, 3, 4, 5, '...', 10]);
	});

	it('handles current page near end', () => {
		expect(calculateVisiblePages(8, 10)).toEqual([1, '...', 6, 7, 8, 9, 10]);
		expect(calculateVisiblePages(10, 10)).toEqual([1, '...', 6, 7, 8, 9, 10]);
	});

	it('handles current page in middle', () => {
		expect(calculateVisiblePages(5, 10)).toEqual([1, '...', 4, 5, 6, '...', 10]);
	});
});

describe('handlePageChange', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubGlobal('window', {
			location: { href: 'http://localhost:3000/test' }
		});
	});

	it('updates URL with new page number', async () => {
		await handlePageChange(2);
		expect(goto).toHaveBeenCalledWith('?page=2', {
			replaceState: true,
			keepFocus: true
		});
	});

	it('handles custom page prefix', async () => {
		await handlePageChange(2, 'custom');
		expect(goto).toHaveBeenCalledWith('?custom=2', {
			replaceState: true,
			keepFocus: true
		});
	});
});
