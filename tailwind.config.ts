import containerQueries from '@tailwindcss/container-queries';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',

	theme: {
		extend: {
			fontFamily: {
				sans: ['Fira Sans', 'sans-serif']
			},
			screens: {
				xs: { max: '455px' },
				sw: '555px'
			}
		}
	},

	plugins: [typography, forms, containerQueries]
} satisfies Config;
