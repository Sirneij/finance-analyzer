<script lang="ts">
	import type { CodeExample, SupportedLanguage } from '$lib/types/docs.types';
	import { LANGUAGES_MAP } from '$lib/utils/contants';

	let {
		examples,
		currentExample = $bindable()
	}: { examples: CodeExample[]; currentExample: CodeExample } = $props();

	let activeLanguage = $state(examples[0]?.language || 'nodejs');

	function copyCode(code: string) {
		navigator.clipboard.writeText(code);
	}

	function switchLanguage(lang: SupportedLanguage) {
		activeLanguage = lang;
		const found = examples.find((example: CodeExample) => example.language === lang);
		if (found) {
			currentExample = found as CodeExample;
		} else {
			console.warn(`No example found for language: ${lang}`);
		}
	}
</script>

<div class="rounded-lg border border-gray-200 dark:border-gray-700">
	<div class="flex border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
		{#each Object.entries(LANGUAGES_MAP) as [lang, { label, icon }]}
			<button
				class="flex items-center gap-2 px-4 py-2 text-sm transition-colors {activeLanguage === lang
					? 'border-b-2 border-blue-500 font-semibold text-blue-600 dark:text-blue-400'
					: 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}"
				onclick={() => switchLanguage(lang as SupportedLanguage)}
			>
				{@html icon}
				{label}
			</button>
		{/each}
	</div>

	{#if currentExample}
		<div class="group relative">
			<button
				onclick={() => copyCode(currentExample.code)}
				class="absolute right-2 top-2 rounded bg-gray-800/30 px-2 py-1 text-xs text-white opacity-0 transition-all hover:bg-gray-800/50 group-hover:opacity-100"
			>
				Copy
			</button>
			<pre>
					<code class="language-{LANGUAGES_MAP[currentExample.language].hljsLanguage}">
						{currentExample.code}
						</code>
					</pre>
		</div>
	{/if}
</div>
