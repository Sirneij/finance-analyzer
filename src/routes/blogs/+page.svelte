<script lang="ts">
	import Paginations from '$lib/components/reusables/Paginations.svelte';
	import {
		estimateReadingTime,
		formatArticleDate
	} from '$lib/utils/helpers/editor/blogs.helpers.js';
	import { fade, fly } from 'svelte/transition';
	import Clock from '$lib/components/icons/Clock.svelte';
	import Calendar from '$lib/components/icons/Calendar.svelte';
	import { debounce } from '$lib/utils/helpers/resume.helpers.js';
	import { SLIDE_DURATION } from '$lib/utils/helpers/misc.transitions.js';
	import AnimatedContainer from '$lib/components/animations/AnimatedContainer.svelte';
	import Warning from '$lib/components/icons/editor/Warning.svelte';
	import Searching from '$lib/components/blog/list/Searching.svelte';
	import Dock from '$lib/components/reusables/Dock.svelte';
	import TagFilter from '$lib/components/blog/list/TagFilter.svelte';

	const { data } = $props();

	let searchQuery = $state(''),
		isSearching = $state(false),
		searchInput = $state<HTMLInputElement>(),
		isFilterOpen = $state(false),
		selectedTags = $state<string[]>([]),
		sortBy = $state('recent'), // 'recent' | 'popular',
		dateRange = $state('all'); // 'all' | 'week' | 'month' | 'year'

	// Debounced search
	const debouncedSearch = debounce((query: string) => {
		isSearching = false;
	}, 300);

	$effect(() => {
		if (searchQuery) {
			isSearching = true;
			debouncedSearch(searchQuery);
		}
	});

	const filteredArticles = $derived.by(() => {
		const query = searchQuery.toLowerCase().trim();
		if (!query) return data.articles;
		return data.articles.filter((article) => {
			const inTitle = article.title.toLowerCase().includes(query);
			const inTags = article.tags?.some((tag) => tag.name.toLowerCase().includes(query));
			return inTitle || inTags;
		});
	});

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
			e.preventDefault();
			searchInput?.focus();
		}
	};
</script>

<svelte:head>
	<title>Articles | Blog</title>
	<meta name="description" content="Browse all articles and blog posts" />
	<meta
		name="keywords"
		content="Technology, Programming, Web Development, Software Engineering, Blog"
	/>
	<meta name="author" content="John Owolabi Idogun" />
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "Blog",
			"name": "Articles",
			"url": "https://johnowolabiidogun.dev/blogs"
		}
	</script>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<AnimatedContainer class="container mx-auto min-h-screen px-4 py-16">
	<div class="mb-10 space-y-8">
		<h1 class="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
			Latest Articles
		</h1>

		<Searching bind:searchInput bind:searchQuery bind:isFilterOpen bind:sortBy bind:dateRange />
		{#if isSearching}
			<div
				class="flex items-center justify-center gap-1 text-sm text-gray-500 dark:text-gray-400"
				role="status"
			>
				<span>Searching</span>
				<div class="flex gap-1" aria-hidden="true">
					<span class="h-1 w-1 animate-[pulse_1.4s_ease-in-out_infinite] rounded-full bg-current"
					></span>
					<span
						class="h-1 w-1 animate-[pulse_1.4s_ease-in-out_infinite_200ms] rounded-full bg-current"
					></span>
					<span
						class="h-1 w-1 animate-[pulse_1.4s_ease-in-out_infinite_400ms] rounded-full bg-current"
					></span>
				</div>
			</div>
		{:else if filteredArticles.length === 0}
			<div class="flex justify-center px-4">
				<div
					class="group relative w-full max-w-2xl animate-[fade-in_0.2s,scale-in_0.2s] rounded-xl bg-amber-50/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-amber-50/90 hover:shadow-xl dark:bg-amber-900/20 dark:hover:bg-amber-900/30"
					role="alert"
				>
					<div class="flex items-center gap-3">
						<Warning
							class="h-5 w-5 text-amber-400 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
						/>
						<p class="text-sm font-medium text-amber-700 dark:text-amber-200">
							No articles found matching "<span class="font-semibold">{searchQuery}</span>"
						</p>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<div
		class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
		role="feed"
		aria-busy={isSearching}
	>
		{#each filteredArticles as article, i (article._id)}
			<article
				in:fly|local={{ y: 20, duration: SLIDE_DURATION, delay: i * 50 }}
				out:fade|local
				class="group relative flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
			>
				<div class="space-y-4">
					<h2 class="group/title line-clamp-2 text-xl font-semibold">
						<a
							href="/blogs/{article.slug}/{article._id}"
							class="inline-block rounded-sm text-gray-900
                                 decoration-blue-500 decoration-2 underline-offset-4
                                 transition-all duration-200 ease-in-out
                                 hover:text-blue-500 hover:underline
                                 focus:outline-none focus:ring-2 focus:ring-blue-500/50 group-hover/title:translate-x-0.5
                                 dark:text-gray-100"
						>
							{article.title}
						</a>
					</h2>
					{#if article.tags?.length}
						<div class="flex flex-wrap gap-2">
							{#each article.tags as tag}
								<span class="tag {tag.name}">
									{tag.name}
								</span>
							{/each}
						</div>
					{/if}

					<div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
						<span class="flex items-center gap-1.5">
							<Clock class="h-4 w-4" />
							<span>{estimateReadingTime(article.content)}</span>
						</span>
						<span class="flex items-center gap-1.5">
							<Calendar class="h-4 w-4" />
							<time datetime={article.createdAt}>
								{formatArticleDate(article.createdAt)}
							</time>
						</span>
					</div>
				</div>
			</article>
		{/each}
	</div>

	<div class="mt-5">
		<Paginations metadata={data.metadata} />
	</div>
</AnimatedContainer>

<Dock>
	<TagFilter tags={data.tags} bind:selectedTags />
</Dock>
