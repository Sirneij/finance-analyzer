<script lang="ts">
	import { fade } from 'svelte/transition';
	import { marked } from '$lib/utils/helpers/docs.helpers';
	import { onMount } from 'svelte';
	import { highlightCode } from '$lib/utils/helpers/docs.helpers';
	import Delete from '$lib/components/icons/Delete.svelte';
	import Edit from '$lib/components/icons/Edit.svelte';
	import Clock from '$lib/components/icons/Clock.svelte';
	import { formatDate } from '$lib/utils/helpers/date.helpers';
	import { browser } from '$app/environment';
	import Share from '$lib/components/icons/Share.svelte';
	import {
		copyUrl,
		estimateReadingTime,
		generateTOC,
		shareContent,
		throttle,
		tocObserver,
		truncateSeriesArticles
	} from '$lib/utils/helpers/editor/blogs.helpers';
	import Copy from '$lib/components/icons/Copy.svelte';
	import BackToTop from '$lib/components/icons/BackToTop.svelte';
	import Check from '$lib/components/icons/Check.svelte';
	import { getModifierKey } from '$lib/utils/commons';
	import { addNotification } from '$lib/states/notification';

	const { data } = $props();

	let showAllSeries = $state(false),
		contentContainer = $state<HTMLDivElement>(),
		scrollProgress = $state(0),
		activeId = $state(''),
		showTocMobile = $state(false),
		showBackToTop = $state(false),
		copySuccess = $state(false),
		scrollY = $state(0),
		innerHeight = $state(0),
		articlElement = $state<HTMLElement>();

	const seriesArticles = [
		{ id: '1', title: 'Getting Started with Svelte 5' },
		{ id: '2', title: 'Understanding Runes' },
		{ id: '3', title: 'State Management' },
		{ id: '4', title: 'Component Lifecycle' },
		{ id: '5', title: 'Props and Events' },
		{ id: '6', title: 'Advanced Patterns' },
		{ id: '7', title: 'Performance Optimization' }
	];

	const seriesDisplay = $derived.by(() => truncateSeriesArticles(seriesArticles, showAllSeries));

	// Calculate reading time
	const readingTime = $derived.by(() => estimateReadingTime(data.article.content));

	// Generate TOC from content
	const tableOfContents = $derived.by(() => generateTOC(data.article.content));

	onMount(() => {
		if (!contentContainer) return;
		highlightCode(contentContainer);

		const observer = tocObserver((id) => (activeId = id));
		contentContainer.querySelectorAll('h2, h3').forEach((heading) => {
			observer.observe(heading);
		});
		return () => observer.disconnect();
	});

	// Enhanced scroll handling
	const handleScroll = throttle(() => {
		requestAnimationFrame(() => {
			const windowHeight = document.documentElement.scrollHeight - innerHeight;

			scrollProgress = Math.min(Math.round((scrollY / windowHeight) * 100), 100);
			showBackToTop = scrollY > 400;
		});
	}, 100);

	// Keyboard shortcuts
	function handleKeyboard(e: KeyboardEvent) {
		if (e.key === 'Escape') showTocMobile = false;
		// Check for both Command (Mac) and Control (Windows/Linux)
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			const toggleButton = articlElement?.querySelector('#toc-toggle') as HTMLButtonElement;
			toggleButton.focus();
			showTocMobile = !showTocMobile;
		}
	}
</script>

<svelte:window on:keydown={handleKeyboard} bind:scrollY bind:innerHeight on:scroll={handleScroll} />

<svelte:head>
	<title>{data.article.title} | John Owolabi Idogun Writes</title>
	<meta name="author" content="John Owolabi Idogun" />
	<meta name="description" content={data.article.content.slice(0, 160)} />

	<!-- Open Graph -->
	<meta property="og:title" content={data.article.title} />
	<meta property="og:description" content={data.article.content.slice(0, 160)} />
	<meta property="og:image" content={data.article.coverImage} />
	<meta property="og:type" content="article" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={data.article.title} />
	<meta name="twitter:description" content={data.article.content.slice(0, 160)} />
	<meta name="twitter:image" content={data.article.coverImage} />

	<!-- Article Schema -->
	<script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": data.article.title,
      "image": data.article.coverImage,
      "datePublished": data.article.createdAt,
      "dateModified": data.article.updatedAt,
      "author": {
        "@type": "Person",
        "name": "John Owolabi Idogun"
      }
    })}
	</script>
</svelte:head>

<article
	class="relative lg:grid lg:grid-cols-[250px_1fr] lg:gap-8"
	transition:fade
	bind:this={articlElement}
	itemscope
	itemtype="https://schema.org/Article"
>
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
		class="fixed inset-y-0 right-0 z-40 w-64 transform overflow-y-auto bg-white p-6 shadow-xl transition-transform dark:bg-gray-900 lg:sticky lg:top-8 lg:mt-8 lg:block lg:h-[calc(100vh-4rem)] lg:w-auto lg:transform-none lg:bg-transparent lg:shadow-none lg:dark:bg-transparent {showTocMobile
			? 'translate-x-0'
			: 'translate-x-full lg:translate-x-0'}"
		aria-label="Table of Contents"
	>
		<h2 class="mb-6 text-lg font-semibold text-gray-900 dark:text-white">On this page</h2>

		<ul class="space-y-3 text-sm">
			{#each tableOfContents as { text, id, level }, index}
				<li style="margin-left: {(level - 2) * 1.5}rem" transition:fade>
					<a
						href="#{id}"
						class="group relative flex items-center gap-4 py-1 transition-all {activeId === id
							? 'text-indigo-600 dark:text-indigo-400'
							: 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}"
						onclick={(e) => {
							e.preventDefault();
							showTocMobile = false;
							articlElement?.querySelector(`#${id}`)?.scrollIntoView({
								behavior: 'smooth',
								block: 'start'
							});
						}}
					>
						<span
							class="flex h-5 w-5 items-center justify-center rounded-full transition-colors {activeId ===
							id
								? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
								: 'bg-gray-100 text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:bg-gray-800 dark:text-gray-400 dark:group-hover:bg-indigo-900/30 dark:group-hover:text-indigo-400'}"
						>
							{index + 1}
						</span>

						<span class="flex-1">{text}</span>

						<span
							class="absolute -left-3 h-full w-1 rounded-full bg-indigo-500 {activeId === id
								? 'opacity-100'
								: 'opacity-0 group-hover:opacity-100'}"
						></span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<!-- Main Content -->
	<main class="min-w-0 p-4" transition:fade>
		<!-- Skip to content link -->
		<a href="#content" class="sr-only focus:not-sr-only"> Skip to content </a>
		<!-- Cover Image -->
		<div class="relative h-[60vh] w-full overflow-hidden rounded-lg">
			<img
				src={data.article.coverImage}
				alt={data.article.title}
				class="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
				loading="lazy"
				width="1200"
				height="630"
				itemprop="image"
			/>
		</div>

		<!-- Enhanced reading progress -->
		{#if browser}
			<div
				class="fixed left-0 top-0 z-50 flex h-1 w-full items-center bg-gray-200 dark:bg-gray-800"
			>
				<div
					class="h-full bg-indigo-600 transition-all duration-150 dark:bg-indigo-500"
					style="width: {scrollProgress}%"
				></div>
				<div
					class="absolute -bottom-6 right-0 rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity hover:opacity-100 dark:bg-white dark:text-gray-900"
				>
					{scrollProgress}% read
				</div>
			</div>
		{/if}

		<!-- Title and Meta -->
		<header class="mt-8 space-y-4">
			<div class="flex items-start justify-between">
				<h1 class="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
					{data.article.title}
				</h1>

				<div class="flex gap-2">
					<button
						class="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
						aria-label="Edit article"
					>
						<Edit class="h-5 w-5" />
					</button>
					<button
						class="rounded-full p-2 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
						aria-label="Delete article"
					>
						<Delete class="h-5 w-5" />
					</button>
				</div>
			</div>

			<div class="flex flex-wrap items-center gap-4">
				<!-- Tags -->
				<div class="card-tag flex flex-wrap gap-2 text-gray-800 dark:text-white">
					{#each data.article.tags as tag}
						<span class="tag {tag.toLowerCase()}">
							{tag}
						</span>
					{/each}
				</div>

				<!-- Dates -->
				<div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
					<div class="flex items-center gap-1">
						<Clock class="h-4 w-4" />
						<time>
							Created {formatDate(data.article.createdAt)}
						</time>
					</div>
					{#if data.article.updatedAt}
						<div class="flex items-center gap-1">
							<Clock class="h-4 w-4" />
							<time>
								Updated {formatDate(data.article.updatedAt)}
							</time>
						</div>
					{/if}
				</div>
			</div>
			<div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
				<span>{readingTime}</span>
				<div class="flex gap-2">
					<button
						class="inline-flex items-center gap-1 rounded-full px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
						onclick={async () => {
							copySuccess = await copyUrl();
							if (copySuccess) {
								setTimeout(() => (copySuccess = false), 2000);
							}
						}}
						aria-label="Copy article link"
					>
						{#if copySuccess}
							<Check class="h-4 w-4" />
							Copied!
						{:else}
							<Copy class="h-4 w-4" />
							Copy link
						{/if}
					</button>
					<button
						class="inline-flex items-center gap-1 rounded-full px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
						onclick={async () => {
							const success = await shareContent({
								title: data.article.title,
								text: data.article.content.slice(0, 160),
								url: window.location.href
							});
							if (success && !navigator.share) {
								addNotification(
									'Article details copied because your browser does not support sharing',
									'warning'
								);
								copySuccess = true;
								setTimeout(() => (copySuccess = false), 2000);
							}
						}}
					>
						<Share class="h-4 w-4" />
						{#if browser && !navigator.share && copySuccess}
							Copied!
						{:else}
							Share
						{/if}
					</button>
				</div>
			</div>
		</header>

		<!-- Series List -->
		{#if data.article.series}
			<div class="mt-8 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
				<h2 class="text-lg font-semibold text-gray-900 dark:text-white">
					{data.article.series} Series
				</h2>
				<div class="mt-4 space-y-2">
					{#each seriesDisplay as article}
						{#if article.id === 'ellipsis'}
							<button
								class="w-full rounded-md p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
								onclick={() => (showAllSeries = true)}
							>
								<span
									class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-sm font-medium dark:bg-gray-700"
								>
									...
								</span>
								<span class="ml-2 text-gray-600 dark:text-gray-400">{article.title}</span>
							</button>
						{:else}
							<a
								href="/blogs/{article.id}"
								class="block rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-800 {article.id ===
								data.article.id
									? 'bg-indigo-50 dark:bg-indigo-900/20'
									: ''}"
							>
								<span
									class="inline-flex h-6 w-6 items-center justify-center rounded-full {article.id ===
									data.article.id
										? 'bg-indigo-200 dark:bg-indigo-800'
										: 'bg-gray-200 dark:bg-gray-700'}"
								>
									{article.id}
								</span>
								<span
									class="ml-2 {article.id === data.article.id
										? 'font-medium text-indigo-600 dark:text-indigo-400'
										: 'text-gray-600 dark:text-gray-400'}"
								>
									{article.title}
								</span>
							</a>
						{/if}
					{/each}
				</div>
			</div>
		{/if}

		<!-- Content -->
		<div
			id="content"
			class="article-content prose prose-lg mt-12 max-w-none dark:prose-invert"
			bind:this={contentContainer}
			itemprop="articleBody"
			role="main"
		>
			{@html marked.parse(data.article.content)}
		</div>
	</main>
</article>

<style lang="postcss">
	nav::-webkit-scrollbar {
		width: 4px;
	}

	nav::-webkit-scrollbar-track {
		@apply rounded bg-transparent;
	}

	nav::-webkit-scrollbar-thumb {
		@apply rounded bg-gray-300 dark:bg-gray-700;
	}
</style>
