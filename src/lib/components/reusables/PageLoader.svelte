<script lang="ts">
	import '$lib/assets/css/code.css';

	import { onMount } from 'svelte';

	let displayCode = $state(''),
		currentLine = $state(0),
		timeout: ReturnType<typeof setTimeout>;

	const codeSnippet = [
		'/** Portfolio, Tech Blog, Financial analysis, and more */',
		'async function loadContent() {',
		'  const portfolio = await fetchPortfolio();',
		'  const articles = await fetchLatestPosts();',
		'  const financials = await fetchFinancials();',
		'  const documentation = await loadDocs();',
		'  return { articles, documentation };',
		'}'
	];

	function typeCode() {
		let charIndex = 0;
		const currentText = codeSnippet[currentLine];

		function type() {
			if (charIndex < currentText.length) {
				displayCode += currentText[charIndex];
				charIndex++;
				timeout = setTimeout(type, 50);
			} else {
				displayCode += '\n';
				currentLine++;
				if (currentLine < codeSnippet.length) {
					timeout = setTimeout(typeCode, 500);
				}
			}
		}
		type();
	}

	onMount(() => {
		typeCode;

		return () => {
			if (timeout) clearTimeout(timeout);
		};
	});

	function highlightSyntax(code: string): string {
		return (
			code
				// Comments
				.replace(/(\/\*\*.*?\*\/)/g, '<span class="comment">$1</span>')
				// Keywords
				.replace(/\b(async|function|await|return|const)\b/g, '<span class="keyword">$1</span>')
				// Function calls
				.replace(/\b(fetch\w+)\b/g, '<span class="function">$1</span>')
				// Strings
				.replace(/(['"])(.*?)\1/g, '<span class="string">$1$2$1</span>')
				// Braces and parentheses
				.replace(/([{}()])/g, '<span class="punctuation">$1</span>')
		);
	}

	$effect(() => {
		displayCode = highlightSyntax(displayCode);
	});
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm dark:bg-gray-900/90"
>
	<div class="w-[600px] rounded-lg bg-white shadow-xl dark:bg-gray-800">
		<div class="flex items-center space-x-2 border-b border-gray-200 p-4 dark:border-gray-700">
			<div class="h-3 w-3 rounded-full bg-red-500"></div>
			<div class="h-3 w-3 rounded-full bg-yellow-500"></div>
			<div class="h-3 w-3 rounded-full bg-green-500"></div>
		</div>
		<pre class="p-4 font-mono text-sm">
            <code class="hljs language-javascript"
				>{@html displayCode}<span class="cursor">|</span></code
			>
        </pre>
	</div>
</div>
