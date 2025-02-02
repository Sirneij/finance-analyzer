import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import basicSsl from '@vitejs/plugin-basic-ssl';
import type { ServerOptions } from 'vite';
import fs from 'fs';

// Only load SSL certificates in development
const isDev = process.env.NODE_ENV === 'development';
const httpsConfig = isDev
	? {
			key: fs.readFileSync('./certs/server.key'),
			cert: fs.readFileSync('./certs/server.crt')
		}
	: false;

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
		port: process.env.PORT ? parseInt(process.env.PORT) : 8000,
		strictPort: false,
		https: httpsConfig as ServerOptions['https']
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
