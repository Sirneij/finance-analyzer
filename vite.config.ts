import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		port: process.env.PORT ? parseInt(process.env.PORT) : 8000,
		strictPort: false
	},
	test: {
		environment: 'jsdom',
		setupFiles: ['./vitest.setup.ts'],
		include: ['src/**/*.{test,spec}.{js,ts}', 'tests/**/*.{test,spec}.{js,ts}']
	}
});
