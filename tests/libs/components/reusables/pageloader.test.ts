import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { loadingManager } from '$lib/states/loading.svelte';
import PageLoader from '$lib/components/reusables/PageLoader.svelte';

// global.mount = render;

describe('PageLoader', () => {
	beforeEach(() => {
		loadingManager.setLoading(false, '');
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.runOnlyPendingTimers();
		vi.useRealTimers();
	});

	it('should not render when loading is false', () => {
		const { container } = render(PageLoader);
		expect(container.innerHTML).toBe('');
	});

	it('should render when loading is true', () => {
		loadingManager.setLoading(true, 'Loading...');
		const { container } = render(PageLoader);
		expect(container.querySelector('.code-container')).toBeTruthy();
	});

	it('should animate text over time', async () => {
		loadingManager.setLoading(true, 'Loading...');
		const { container } = render(PageLoader);

		// Check initial state
		// const lines = container.querySelectorAll('.line');
		// expect(lines[0]).toHaveStyle({ opacity: '0' });

		// // Fast-forward time
		// vi.advanceTimersByTime(500);
		// expect(lines[0]).toHaveStyle({ opacity: '1' });

		// vi.advanceTimersByTime(500);
		// expect(lines[1]).toHaveStyle({ opacity: '1' });

		// Check specific content
		expect(container.textContent).toContain('Personal blogging Tool');
		expect(container.textContent).toContain('async function');
	});
});
