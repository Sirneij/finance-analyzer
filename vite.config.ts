import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		port: 8000,
		strictPort: false
	},

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
