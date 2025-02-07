<script lang="ts">
	import type { IArticlePopulated } from '$lib/types/articles.types';
	import { getModifierKey } from '$lib/utils/commons';
	import { generateTOC } from '$lib/utils/helpers/editor/blog.helpers';

	let {
		activeId,
		showTocMobile = $bindable(),
		article,
		articlElement = $bindable()
	}: {
		activeId: string;
		showTocMobile: boolean;
		article: IArticlePopulated;
		articlElement: HTMLElement;
	} = $props();

	// Generate TOC from content
	const tableOfContents = $derived.by(() => generateTOC(article.content));
</script>

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
	<kbd class="ml-2 hidden rounded-sm bg-indigo-700 px-2 py-0.5 text-xs sm:inline-block">
		{getModifierKey()} + K
	</kbd>
</button>

<!-- TOC Sidebar -->
<nav
	class="fixed inset-y-0 right-0 z-40 w-64 transform overflow-y-auto bg-white p-6 shadow-xl transition-transform lg:sticky lg:block lg:w-auto lg:p-2 dark:bg-gray-900
    {showTocMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}"
	aria-label="Table of Contents"
>
	<h2
		class="mb-6 text-lg font-semibold text-gray-900 lg:mb-2 dark:text-white"
		title="On this page"
		aria-label="On this page"
	>
		On this page
	</h2>

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
					title={text}
					aria-label={text}
				>
					<span class="line-clamp-1">
						{text}
					</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>
