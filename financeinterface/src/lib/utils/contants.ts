import type { SupportedLanguage } from '$lib/types/docs.types';

export const BASE_API_URI = import.meta.env.DEV
	? import.meta.env.VITE_BASE_API_URI_DEV
	: import.meta.env.VITE_BASE_API_URI_PROD;

export const WEBSITE_URL = import.meta.env.VITE_WEBSITE_URL;
export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL;

export const BASE_WS_URI = BASE_API_URI.replace(/^http/, 'ws').replace('/api', '/ws');

export const COLORS = {
	income: {
		chart: '#22C55E',
		background: 'bg-green-500'
	},
	expense: {
		chart: '#EF4444',
		background: 'bg-red-500'
	},
	savings: {
		chart: '#4F46E5',
		background: 'bg-indigo-500'
	},
	balance: {
		chart: '#6B7280',
		background: 'bg-gray-500'
	}
};

export const LANGUAGES: SupportedLanguage[] = ['nodejs', 'python', 'go', 'rust'];

interface Language {
	label: string;
	icon: string;
	hljsLanguage: string;
}

export const LANGUAGES_MAP: Record<SupportedLanguage, Language> = {
	nodejs: {
		label: 'index.js',
		icon: '<svg class="h-4 w-4"  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="#339933"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-brand-nodejs"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 9v8.044a2 2 0 0 1 -2.996 1.734l-1.568 -.9a3 3 0 0 1 -1.436 -2.561v-6.635a3 3 0 0 1 1.436 -2.56l6 -3.667a3 3 0 0 1 3.128 0l6 3.667a3 3 0 0 1 1.436 2.561v6.634a3 3 0 0 1 -1.436 2.56l-6 3.667a3 3 0 0 1 -3.128 0" /><path d="M17 9h-3.5a1.5 1.5 0 0 0 0 3h2a1.5 1.5 0 0 1 0 3h-3.5" /></svg>',
		hljsLanguage: 'javascript'
	},
	python: {
		label: 'main.py',
		icon: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="#3776AB"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-brand-python"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 9h-7a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h3" /><path d="M12 15h7a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-3" /><path d="M8 9v-4a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v5a2 2 0 0 1 -2 2h-4a2 2 0 0 0 -2 2v5a2 2 0 0 0 2 2h4a2 2 0 0 0 2 -2v-4" /><path d="M11 6l0 .01" /><path d="M13 18l0 .01" /></svg>',
		hljsLanguage: 'python'
	},
	go: {
		label: 'main.go',
		icon: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="#00ADD8"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-brand-golang"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15.695 14.305c1.061 1.06 2.953 .888 4.226 -.384c1.272 -1.273 1.444 -3.165 .384 -4.226c-1.061 -1.06 -2.953 -.888 -4.226 .384c-1.272 1.273 -1.444 3.165 -.384 4.226z" /><path d="M12.68 9.233c-1.084 -.497 -2.545 -.191 -3.591 .846c-1.284 1.273 -1.457 3.165 -.388 4.226c1.07 1.06 2.978 .888 4.261 -.384a3.669 3.669 0 0 0 1.038 -1.921h-2.427" /><path d="M5.5 15h-1.5" /><path d="M6 9h-2" /><path d="M5 12h-3" /></svg>',
		hljsLanguage: 'go'
	},
	rust: {
		label: 'main.rs',
		icon: '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="#000000"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-brand-rust"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.139 3.463c.473 -1.95 3.249 -1.95 3.722 0a1.916 1.916 0 0 0 2.859 1.185c1.714 -1.045 3.678 .918 2.633 2.633a1.916 1.916 0 0 0 1.184 2.858c1.95 .473 1.95 3.249 0 3.722a1.916 1.916 0 0 0 -1.185 2.859c1.045 1.714 -.918 3.678 -2.633 2.633a1.916 1.916 0 0 0 -2.858 1.184c-.473 1.95 -3.249 1.95 -3.722 0a1.916 1.916 0 0 0 -2.859 -1.185c-1.714 1.045 -3.678 -.918 -2.633 -2.633a1.916 1.916 0 0 0 -1.184 -2.858c-1.95 -.473 -1.95 -3.249 0 -3.722a1.916 1.916 0 0 0 1.185 -2.859c-1.045 -1.714 .918 -3.678 2.633 -2.633a1.914 1.914 0 0 0 2.858 -1.184z" /><path d="M8 12h6a2 2 0 1 0 0 -4h-6v8v-4z" /><path d="M19 16h-2a2 2 0 0 1 -2 -2a2 2 0 0 0 -2 -2h-1" /><path d="M9 8h-4" /><path d="M5 16h4" /></svg>',
		hljsLanguage: 'rust'
	}
};

export const GITHUB_AUTH_TOKEN: string = import.meta.env.VITE_GITHUB_AUTH_TOKEN;
export const GITHUB_USERNAME: string = import.meta.env.VITE_GITHUB_USERNAME;

export const NAME_OF_TOOLS_ON_DEVICON_TO_INCLUDE = {
	'c++': 'cplusplus',
	'c#': 'csharp',
	html: 'html5',
	css: 'css3',
	scss: 'sass',
	shell: 'bash',
	plpgsql: 'postgresql',
	'openedge abl': 'progress',
	cypher: 'neo4j',
	makefile: 'cmake',
	batchfile: 'windows11',
	procfile: 'heroku',
	'jupyter notebook': 'jupyter',
	dockerfile: 'docker'
};

export const NAME_OF_TOOLS_ON_DEVICON_TO_EXCLUDE = ['openedge abl'];
export const GITHUB_LANGUAGE_COLORS = {
	javascript: '#f1e05a',
	typescript: '#3178c6',
	html5: '#e34c26',
	css3: '#563d7c',
	python: '#3572A5',
	java: '#b07219',
	ruby: '#701516',
	php: '#4F5D95',
	cplusplus: '#f34b7d',
	c: '#555555',
	swift: '#ffac45',
	go: '#00ADD8',
	rust: '#dea584',
	bash: '#89e051',
	docker: '#384d54',
	csharp: '#178600',
	sass: '#a53b70',
	scala: '#c22d40',
	postgresql: '#336791',
	neo4j: '#008CC1',
	jupyter: '#DA5B0B',
	heroku: '#79589f',
	cmake: '#064F8C',
	windows11: '#0078D6',
	progress: '#4A245E',
	less: '#1d365d',
	django: '#092e20',
	perl: '#0298c3',
	flask: '#000000',
	tex: '#3D6117'
};

export const TESTIMONIALS = [
	{
		name: 'Frances Nnamadim',
		title: 'Senior Specialist, IT Business Analyst, IHS Towers',
		text: 'John is a person with excellent programming and software development skills. He carries out his duties with due diligence and enthusiasm thus giving out his best. He is dedicated to providing quality work. He is very determined and focused. John would be an asset to any organization.',
		image:
			'https://media.licdn.com/dms/image/v2/D4D03AQHss3lJD-yAtg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1663930667664?e=1742428800&v=beta&t=UJGU_-YKojjkCMDWknpz7guT63VV2tOPyuDqoriiQ7g',
		link: 'https://www.linkedin.com/in/john-owolabi-idogun/details/recommendations/'
	},
	{
		name: 'Oluwaseun Oyeyemi',
		title: 'Software Engineer, Andela',
		text: 'John is a very dedicated and hardworking individual. He is very passionate about his work and is always willing to go the extra mile to get things done. He is a great team player and is always willing to help others. I would highly recommend John for any software development role.',
		image:
			'https://media.licdn.com/dms/image/C5603AQH6lN5z6v9VzQ/profile-displayphoto-shrink_400_400/0/1517346844421?e=1742428800&v=beta&t=O4pYX0j6r3vQFw6Uj5ZKj5K0V8X5p1o9g9Z8YRf5o0s',
		link: 'https://www.linkedin.com/in/john-owolabi-idogun/details/recommendations/'
	},
	{
		name: 'Oluwaseun Oyeyemi',
		title: 'Software Engineer, Andela',
		text: 'John is a very dedicated and hardworking individual. He is very passionate about his work and is always willing to go the extra mile to get things done. He is a great team player and is always willing to help others. I would highly recommend John for any software development role.',
		image:
			'https://media.licdn.com/dms/image/C5603AQH6lN5z6v9VzQ/profile-displayphoto-shrink_400_400/0/1517346844421?e=1742428800&v=beta&t=O4pYX0j6r3vQFw6Uj5ZKj5K0V8X5p1o9g9Z8YRf5o0s',
		link: 'https://www.linkedin.com/in/john-owolabi-idogun/details/recommendations/'
	},
	{
		name: 'Oluwaseun Oyeyemi',
		title: 'Software Engineer, Andela',
		text: 'John is a very dedicated and hardworking individual. He is very passionate about his work and is always willing to go the extra mile to get things done. He is a great team player and is always willing to help others. I would highly recommend John for any software development role.'
	}
];
