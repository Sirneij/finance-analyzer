import { sentrySvelteKit } from "@sentry/sveltekit";
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sentrySvelteKit({
        sourceMapsUploadOptions: {
            org: "john-owolabi-idogun",
            project: "javascript-sveltekit"
        }
    }), sveltekit()],
	server: {
		port: 8000,
		strictPort: false
	},

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});