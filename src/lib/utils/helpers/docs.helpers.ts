import type { Endpoint, HttpMethod } from '$lib/types/docs.types';
import { marked } from 'marked';

export function groupEndpointsByCategory(endpoints: Endpoint[]): Record<string, Endpoint[]> {
	return endpoints.reduce(
		(acc, endpoint) => {
			const category = endpoint.path.split('/')[2] || 'other';
			if (!acc[category]) {
				acc[category] = [];
			}
			acc[category].push(endpoint);
			return acc;
		},
		{} as Record<string, Endpoint[]>
	);
}

export function getMethodColor(method: HttpMethod): string {
	const colors = {
		GET: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
		POST: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
		PUT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
		DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
	};
	return colors[method];
}

export function formatRange(num: number): string {
	const ranges = [
		{ value: 1e9, symbol: 'B' },
		{ value: 1e6, symbol: 'M' },
		{ value: 1e3, symbol: 'K' }
	];

	// Handle large numbers
	for (const range of ranges) {
		if (num >= range.value) {
			const scaled = num / range.value;
			const rounded = scaled >= 10 ? Math.floor(scaled) : Math.floor(scaled * 10) / 10;
			return `${rounded}${range.symbol}+`;
		}
	}

	// Handle smaller ranges
	if (num < 30) return '10+';
	if (num < 60) return '30+';
	if (num < 100) return '60+';

	// Handle hundreds (100+)
	const hundreds = Math.floor(num / 100) * 100;
	return `${hundreds}+`;
}

export function getStatusColorClass(status: string): string {
	const statusCode = parseInt(status, 10);
	if (statusCode >= 200 && statusCode < 300) {
		return 'from-green-500 to-emerald-500';
	} else if (statusCode >= 300 && statusCode < 400) {
		return 'from-blue-500 to-indigo-500';
	} else if (statusCode >= 400 && statusCode < 500) {
		return 'from-yellow-500 to-orange-500';
	} else if (statusCode >= 500) {
		return 'from-red-500 to-rose-500';
	}
	return 'from-gray-500 to-slate-500'; // default
}

export const sampleBaseURL = `
\`\`\`javascript
const BASE_API_URI = 'https://finanalyzer.johnowolabiidogun.dev/api/v1';
\`\`\`
`;

export const sampleAuth = `
\`\`\`javascript
const response = await fetch(\`\${BASE_API_URI}/...\`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        Cookie: \`connect.sid=\${cookies.get('connect.sid')}\`
    }
});
\`\`\`
`;

export function changeCodeBlockTheme(themeName: string) {
	document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]').forEach((link) => {
		// Only target theme CSS files
		if (link.href.includes('/themes/')) {
			const shouldEnable = link.href.includes(themeName);
			link.disabled = !shouldEnable;
		}
	});
}

interface Code {
	text: string;
	lang?: string;
	escaped?: boolean;
}

const renderer = new marked.Renderer();

renderer.code = function ({ text, lang }: Code) {
	const validLanguage = lang || 'text';
	const lines = text.split('\n');

	return `
	  <div class="relative group rounded-lg overflow-hidden">
		<!-- Controls Container -->
		<div class="absolute right-2 top-2 z-10 flex items-center gap-2">
		  <!-- Copy Button -->
		  <button 
			onclick="(() => {
			  const button = this;
			  navigator.clipboard.writeText(this.parentElement.parentElement.querySelector('code').textContent)
				.then(() => {
				  button.querySelector('.copy-icon').style.display = 'none';
				  button.querySelector('.check-icon').style.display = 'block';
				  setTimeout(() => {
					button.querySelector('.copy-icon').style.display = 'block';
					button.querySelector('.check-icon').style.display = 'none';
				  }, 2000);
				});
			})()"
			class="opacity-0 group-hover:opacity-100 rounded-md bg-gray-100/80 dark:bg-gray-700/80 p-2 text-gray-600 dark:text-gray-300 transition-all hover:bg-gray-200 dark:hover:bg-gray-600 backdrop-blur flex items-center gap-1"
			title="Copy code"
		  >
			<svg class="copy-icon h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
			</svg>
			<svg class="check-icon h-4 w-4" style="display: none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
			</svg>
		  </button>
		  
		  <!-- Language Badge -->
		  <span class="rounded-md bg-gray-100/80 dark:bg-gray-700/80 px-2 py-1 text-xs font-mono text-gray-600 dark:text-gray-300 transition-colors backdrop-blur">
			${validLanguage}
		  </span>
		</div>
  
		<!-- Code Block -->
		<div class="flex">
		  <!-- Line Numbers -->
		  <div class="hidden sm:flex flex-col items-end px-4 py-3.5 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-400 select-none font-mono">
			${lines.map((_, i) => `<span class="leading-6">${i + 1}</span>`).join('')}
		  </div>
		  
		  <!-- Code Content -->
		  <pre class="flex-1"><code class="language-${validLanguage}">${text}</code></pre>
		</div>
	  </div>
	`;
};

marked.setOptions({ renderer });

export { marked };
