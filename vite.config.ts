import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import basicSsl from '@vitejs/plugin-basic-ssl';
import type { ServerOptions } from 'vite';
import fs from 'fs';

export default defineConfig({
	plugins: [
		tailwindcss(),
		basicSsl(),
		sveltekit(),
		visualizer({
			emitFile: true,
			filename: 'stats.html'
		})
	],
	server: {
		port: 8000,
		strictPort: false,
		https: {
			// You can specify certificate paths if you have them
			key: fs.readFileSync('./certs/server.key'),
			cert: fs.readFileSync('./certs/server.crt')
		} as ServerOptions['https']
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
