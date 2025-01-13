<script lang="ts">
	import type { CodeExample, SupportedLanguage } from '$lib/types/docs.types';
	import { LANGUAGES_MAP } from '$lib/utils/contants';
	import Check from '$lib/components/icons/Check.svelte';
	import Copy from '$lib/components/icons/Copy.svelte';

	let {
		examples,
		currentExample = $bindable()
	}: { examples: CodeExample[]; currentExample: CodeExample } = $props();

	let activeLanguage = $state(examples[0]?.language || 'nodejs'),
		copied: SupportedLanguage[] = $state([]);

	function copyCode(code: string) {
		navigator.clipboard.writeText(code);
		if (!copied.includes(activeLanguage)) copied.push(activeLanguage);
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
	<div class="scrollbar-hide overflow-x-auto">
		<div
			class="flex min-w-fit border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
		>
			{#each Object.entries(LANGUAGES_MAP) as [lang, { label, icon }]}
				<button
					class="flex shrink-0 items-center gap-2 px-4 py-2 text-sm transition-colors {activeLanguage ===
					lang
						? 'border-b-2 border-indigo-500 font-semibold text-indigo-600 dark:text-indigo-400'
						: 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}"
					onclick={() => switchLanguage(lang as SupportedLanguage)}
				>
					{@html icon}
					{label}
				</button>
			{/each}
		</div>
	</div>

	{#if currentExample}
		<div class="group relative">
			<button
				onclick={() => copyCode(currentExample.code)}
				class="absolute right-2 top-2 flex items-center gap-1 rounded bg-gray-800/30 px-2 py-1 text-xs text-white opacity-0 transition-all hover:bg-gray-800/50 group-hover:opacity-100"
			>
				{#if copied.includes(activeLanguage)}
					<Check class="h-4 w-4" />
					<span>Copied!</span>
				{:else}
					<Copy class="h-4 w-4" />
					<span>Copy</span>
				{/if}
			</button>
			<pre>
					<code class="language-{LANGUAGES_MAP[currentExample.language].hljsLanguage}">
						{currentExample.code}
						</code>
					</pre>
		</div>
	{/if}
</div>
