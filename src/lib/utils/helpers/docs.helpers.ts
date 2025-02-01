import type { Endpoint, HttpMethod } from '$lib/types/docs.types';
import { marked } from 'marked';
import hljs from 'highlight.js';

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
	const headerMatch = lang?.match(/^(\w+)\s*:(?:([^[\s]+))?(?:\s*\[([^\]]+)\])?:$/);
	const validLanguage = headerMatch ? headerMatch[1] : lang || 'text';
	const filename = headerMatch?.[2]?.trim();
	const lNos = headerMatch?.[3]?.split(',').map((n) => parseInt(n.trim())) || [];
	const lines = text.split('\n');

	// Escape HTML characters
	const escapedText = text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');

	const filenameHTML = filename
		? `<div class="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
		<span class="font-mono text-sm text-gray-600 dark:text-gray-400">${filename}</span>
		</div>`
		: '';

	const formatLNosIndexI = (index: number) => {
		const start = 13;
		if (index < 1) return start;
		else if (index === 1) return start + 25;
		else if (index === 2) return start + 50;
		else if (index === 3) return start + 73;
		else if (index === 4) return start + 98;
		else if (index === 5) return start + 123;
		else if (index === 6) return start + 145;
		else if (index === 7) return start + 169;
		else if (index === 8) return start + 194;
		else if (index === 9) return start + 219;
		// Generalized formula
	};

	const formatLNosIndex = (index: number): string => {
		const baseRem = 0.803125; // 12.85px / 16
		const stepRem = 1.509375; // 24.15px / 16
		const clampedIndex = index < 0 ? 0 : index;
		return `${(baseRem + stepRem * clampedIndex).toFixed(6)}rem`;
	};

	const formatLNosText = (ls: string[]) => {
		return ls
			.map((_, i) =>
				lNos.includes(i)
					? `<div class="absolute w-full h-6 bg-yellow-100/40 dark:bg-yellow-500/10" style="top: ${formatLNosIndex(i - 1)}"></div>`
					: ''
			)
			.join('');
	};

	const lNosHTML =
		lNos.length > 0
			? `<div class="absolute inset-0 pointer-events-none" style="z-index: 1">${formatLNosText(lines)}</div>`
			: '';

	return `
	  <div class="relative group rounded-lg overflow-hidden">
      ${filenameHTML}

      <div class="relative">
        ${lNosHTML}
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
			class="opacity-0 group-hover:opacity-100 rounded-md bg-gray-100/80 dark:bg-gray-700/80 p-2 text-gray-600 dark:text-gray-300 transition-all hover:bg-gray-200 dark:hover:bg-gray-600 backdrop-blur-sm flex items-center gap-1"
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
		  <span class="rounded-md bg-gray-100/80 dark:bg-gray-700/80 px-2 py-1 text-xs font-mono text-gray-600 dark:text-gray-300 transition-colors backdrop-blur-sm">
			${validLanguage}
		  </span>
		</div>
  
		<!-- Code Block -->
		<div class="grid grid-cols-[auto_1fr]">
			<!-- Line Numbers -->
			<div class="hidden sm:block p-3.5 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-400 select-none">
				${lines.map((_, i) => `<div class="leading-6">${i + 1}</div>`).join('')}
			</div>
			
			<!-- Code Content -->
			<pre>
				<code class="language-${validLanguage} leading-6">${escapedText}</code>
			</pre>
		</div>
	  </div>
	`;
};

renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
	if (depth === 2 || depth === 3) {
		const id = text
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');

		return `<h${depth} id="${id}">${text}</h${depth}>`;
	}
	return `<h${depth}>${text}</h${depth}>`;
};

marked.setOptions({
	renderer,
	gfm: true
});

export { marked };

export function highlightCode(descriptionContainer: HTMLDivElement) {
	requestAnimationFrame(() => {
		const codeBlocks = descriptionContainer?.querySelectorAll('pre code');
		codeBlocks?.forEach((codeBlock) => {
			if (codeBlock instanceof HTMLElement) {
				try {
					// If the code block is already highlighted, first unset `dataset.highlighted` by deleting it
					if (codeBlock.dataset.highlighted) {
						delete codeBlock.dataset.highlighted;
					}

					hljs.highlightElement(codeBlock);
				} catch (error) {
					console.error('Error applying syntax highlighting:', error);
				}
			}
		});
	});
}
