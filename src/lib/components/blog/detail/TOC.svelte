<script lang="ts">
	import BackToTop from '$lib/components/icons/BackToTop.svelte';
	import type { IArticlePopulated } from '$lib/types/articles.types';
	import { getModifierKey } from '$lib/utils/commons';
	import { generateTOC } from '$lib/utils/helpers/editor/blogs.helpers';
	import { fade } from 'svelte/transition';

	let {
		activeId,
		showTocMobile = $bindable(),
		showBackToTop,
		article,
		articlElement = $bindable()
	}: {
		activeId: string;
		showTocMobile: boolean;
		showBackToTop: boolean;
		article: IArticlePopulated;
		articlElement: HTMLElement;
	} = $props();

	// Generate TOC from content
	const tableOfContents = $derived.by(() => generateTOC(article.content));
</script>

<!-- Back to top button -->
{#if showBackToTop}
	<button
		class="fixed bottom-20 right-4 z-50 rounded-full bg-indigo-600 p-3 text-white shadow-lg transition-opacity duration-200 hover:bg-indigo-700 lg:bottom-8"
		onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
		aria-label="Back to top"
		transition:fade
	>
		<BackToTop class="h-6 w-6" />
	</button>
{/if}
<!-- Enhanced Mobile TOC Toggle -->
<button
	id="toc-toggle"
	class="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-white shadow-lg lg:hidden"
	onclick={() => (showTocMobile = !showTocMobile)}
	aria-label="Toggle table of contents"
	aria-expanded={showTocMobile}
>
	<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
		<path d="M4 6h16M4 12h16M4 18h16" />
	</svg>
	<span class="text-sm">Contents</span>
	<kbd class="ml-2 hidden rounded bg-indigo-700 px-2 py-0.5 text-xs sm:inline-block">
		{getModifierKey()} + K
	</kbd>
</button>

<!-- TOC Sidebar -->
<nav
	class="fixed inset-y-0 right-0 z-40 w-64 transform overflow-y-auto bg-white p-6 shadow-xl transition-transform lg:sticky lg:top-20 lg:mt-12 lg:block lg:h-[calc(100vh-4rem)] lg:w-auto lg:transform-none lg:bg-transparent lg:shadow-none dark:bg-gray-900 lg:dark:bg-transparent
    {showTocMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}"
	aria-label="Table of Contents"
>
	<h2 class="mb-6 text-lg font-semibold text-gray-900 dark:text-white">On this page</h2>

	<ul class="space-y-0.5">
		{#each tableOfContents as { text, id, level }}
			<li>
				<a
					href="#{id}"
					class="group block border-l-2 px-4 py-2 transition-all duration-200
						{level === 2 ? 'text-sm font-medium' : 'pl-8 text-xs'}
						{activeId === id
						? 'border-l-indigo-600 bg-indigo-50/50 text-indigo-600 dark:border-l-indigo-400 dark:bg-indigo-900/20 dark:text-indigo-400'
						: 'border-l-transparent text-gray-600 hover:border-l-gray-300 hover:bg-gray-50/50 dark:text-gray-400 dark:hover:border-l-gray-600 dark:hover:bg-gray-800/30'}"
					onclick={(e) => {
						e.preventDefault();
						showTocMobile = false;
						articlElement?.querySelector(`#${id}`)?.scrollIntoView({
							behavior: 'smooth',
							block: 'start'
						});
					}}
				>
					<span class="line-clamp-1">
						{text}
					</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>
