import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		visualizer({
			emitFile: true,
			filename: 'stats.html'
		})
	],
	server: {
		port: 8000,
		strictPort: false
	},

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
	// build: {
	// 	// chunkSizeWarningLimit: 1000,
	// 	rollupOptions: {
	// 		output: {
	// 			manualChunks(id) {
	// 				if (id.includes('node_modules')) {
	// 					return 'vendor';
	// 				}
	// 			}
	// 		}
	// 	}
	// }
});
