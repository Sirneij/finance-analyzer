<script lang="ts">
	import Paginations from '$lib/components/reusables/Paginations.svelte';
	import {
		estimateReadingTime,
		formatArticleDate
	} from '$lib/utils/helpers/editor/blogs.helpers.js';
	import { fade, fly } from 'svelte/transition';

	import { SLIDE_DURATION } from '$lib/utils/helpers/misc.transitions.js';
	import AnimatedContainer from '$lib/components/animations/AnimatedContainer.svelte';
	import Warning from '$lib/components/icons/editor/Warning.svelte';
	import Searching from '$lib/components/blog/list/Searching.svelte';
	import Dock from '$lib/components/reusables/Dock.svelte';
	import CalendarUpdate from '$lib/components/icons/CalendarUpdate.svelte';
	import Glasses from '$lib/components/icons/Glasses.svelte';

	const { data } = $props();

	let searchResponse = $state(''),
		isSearching = $state(false),
		searchInput = $state<HTMLInputElement>(),
		isFilterOpen = $state(false),
		selectedTags = $state<string[]>([]),
		sortBy = $state('recent'), // 'recent' | 'popular',
		dateRange = $state('all'); // 'all' | 'week' | 'month' | 'year'

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
			e.preventDefault();
			searchInput?.focus();
		}
	};
</script>

<svelte:window on:keydown={handleKeydown} />

<AnimatedContainer class="container mx-auto min-h-screen min-w-0 max-w-[75rem] p-4">
	<div class="mb-10 space-y-8">
		<h1 class="text-center text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
			Latest Articles
		</h1>

		<Searching
			bind:isSearching
			bind:searchInput
			bind:searchResponse
			bind:isFilterOpen
			bind:sortBy
			bind:dateRange
			bind:selectedTags
			tags={data.tags}
			tagsMetadata={data.tagsMetadata}
		/>

		{#if !isSearching && data.articles.length === 0}
			<div class="flex justify-center px-4">
				<div
					class="backdrop-blur-xs group relative w-full max-w-2xl animate-[fade-in_0.2s,scale-in_0.2s] rounded-xl bg-amber-50/80 p-6 shadow-lg transition-all duration-300 hover:bg-amber-50/90 hover:shadow-xl dark:bg-amber-900/20 dark:hover:bg-amber-900/30"
					role="alert"
				>
					<div class="flex items-center gap-3">
						<Warning
							class="h-5 w-5 text-amber-400 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
						/>
						<p class="text-sm font-medium text-amber-700 dark:text-amber-200">
							{#if searchResponse}
								No articles found matching "<span class="font-semibold">{searchResponse}</span>"
							{:else}
								No articles found
							{/if}
						</p>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<div
		class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
		role="feed"
		aria-busy={isSearching}
	>
		{#each data.articles as article, i (article._id)}
			<article
				in:fly|local={{ y: 20, duration: SLIDE_DURATION, delay: i * 50 }}
				out:fade|local
				class="shadow-xs group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 transition-all hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
			>
				<div class="space-y-4">
					<h2
						class="group/title line-clamp-2 text-xl font-semibold"
						style="display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden;"
					>
						<a
							href="/blogs/{article.slug}/{article._id}"
							class="focus:outline-hidden inline-block rounded-sm text-gray-900 decoration-blue-500 decoration-2 underline-offset-4 transition-all duration-200 ease-in-out hover:text-blue-500 hover:underline focus:ring-2 focus:ring-blue-500/50 group-hover/title:translate-x-0.5 dark:text-gray-100"
						>
							{article.title}
						</a>
					</h2>
					{#if article.tags?.length}
						<div class="flex flex-wrap gap-1">
							{#each article.tags as tag}
								<span class="tag {tag.name}">
									{tag.name}
								</span>
							{/each}
						</div>
					{/if}

					<div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
						<span class="flex items-center gap-1.5">
							<Glasses class="h-4 w-4" />
							<span>{estimateReadingTime(article.content)}</span>
						</span>
						<span class="flex items-center gap-1.5">
							<CalendarUpdate class="h-4 w-4" />
							<time datetime={article.updatedAt}>
								{formatArticleDate(article.updatedAt)}
							</time>
						</span>
					</div>
				</div>
			</article>
		{/each}
	</div>

	<div class="mt-5">
		<Paginations metadata={data.articleMetadata} />
	</div>
</AnimatedContainer>

{#if data.user && data.user.isJohnOwolabiIdogun}
	<Dock title="Navigation" />
{/if}
