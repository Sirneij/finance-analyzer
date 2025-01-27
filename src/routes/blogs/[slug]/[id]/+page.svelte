<script lang="ts">
	import { fade } from 'svelte/transition';
	import { marked } from '$lib/utils/helpers/docs.helpers';
	import { onMount } from 'svelte';
	import { highlightCode } from '$lib/utils/helpers/docs.helpers';
	import { browser } from '$app/environment';
	import { throttle, tocObserver } from '$lib/utils/helpers/editor/blogs.helpers';
	import Head from '$lib/components/blog/detail/Head.svelte';
	import TOC from '$lib/components/blog/detail/TOC.svelte';
	import Header from '$lib/components/blog/detail/Header.svelte';
	import Series from '$lib/components/blog/detail/Series.svelte';
	import { page } from '$app/state';
	import Dock from '$lib/components/reusables/Dock.svelte';

	const { data } = $props();

	let contentContainer = $state<HTMLDivElement>(),
		scrollProgress = $state(0),
		activeId = $state(''),
		showTocMobile = $state(false),
		showBackToTop = $state(false),
		scrollY = $state(0),
		innerHeight = $state(0),
		articlElement = $state<HTMLElement>();

	onMount(() => {
		if (!contentContainer) return;

		const observer = tocObserver((id) => (activeId = id));
		contentContainer.querySelectorAll('h2, h3').forEach((heading) => {
			observer.observe(heading);
		});
		return () => observer.disconnect();
	});

	$effect(() => {
		if (contentContainer && data.article) {
			highlightCode(contentContainer);
		}
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

<Head article={data.article} />

<article
	class="detail relative lg:grid lg:grid-cols-[250px_1fr] lg:gap-8"
	transition:fade
	bind:this={articlElement}
	itemscope
	itemtype="https://schema.org/Article"
>
	<TOC {activeId} bind:showTocMobile {showBackToTop} article={data.article} bind:articlElement />

	<!-- Main Content -->
	<main class="min-w-0 p-4" transition:fade>
		<!-- Skip to content link -->
		<a href="#content" class="sr-only focus:not-sr-only"> Skip to content </a>
		<!-- Cover Image -->
		<div class="relative h-[60vh] w-full overflow-hidden rounded-lg">
			<img
				src={data.article.foreImage}
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
		<Header article={data.article} />

		<!-- Series List -->
		<Series article={data.article} />

		<!-- Content -->
		<div
			id="content"
			class="article-content prose prose-lg dark:prose-invert mt-12 max-w-none"
			bind:this={contentContainer}
			itemprop="articleBody"
			role="main"
		>
			{@html marked.parse(data.article.content)}
		</div>
	</main>
</article>
{#if page.data.user && page.data.user.isJohnOwolabiIdogun}
	<Dock title="Navigation" />
{/if}
