<script lang="ts">
	import { fade } from 'svelte/transition';
	import { marked } from '$lib/utils/helpers/docs.helpers';
	import { onMount } from 'svelte';
	import { highlightCode } from '$lib/utils/helpers/docs.helpers';
	import { browser } from '$app/environment';
	import {
		addScreenReaderLabels,
		throttle,
		tocObserver
	} from '$lib/utils/helpers/editor/blogs.helpers';
	import Head from '$lib/components/blog/detail/Head.svelte';
	import TOC from '$lib/components/blog/detail/TOC.svelte';
	import Header from '$lib/components/blog/detail/Header.svelte';
	import Series from '$lib/components/blog/detail/Series.svelte';
	import Dock from '$lib/components/reusables/Dock.svelte';
	import BackToTop from '$lib/components/icons/BackToTop.svelte';
	import Breadcrumbs from '$lib/components/reusables/Breadcrumbs.svelte';

	const { data } = $props();

	let contentContainer = $state<HTMLDivElement>(),
		scrollProgress = $state(0),
		activeId = $state(''),
		showTocMobile = $state(false),
		showBackToTop = $state(false),
		scrollY = $state(0),
		innerHeight = $state(0),
		articlElement = $state<HTMLElement>(),
		windowWidth = $state(0);
	const MOBILE_BREAKPOINT = 1024;

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

	const crumbs = [{ text: 'Blogs', href: '/blogs' }, { text: data.article.title }];

	$effect(() => {
		if (contentContainer) {
			addScreenReaderLabels(contentContainer);
		}
	});
</script>

<svelte:window
	bind:innerWidth={windowWidth}
	on:keydown={handleKeyboard}
	bind:scrollY
	bind:innerHeight
	on:scroll={handleScroll}
/>

<Head article={data.article} />

<article
	class="detail relative"
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
	<!-- Only show TOC component on mobile -->
	{#if windowWidth < MOBILE_BREAKPOINT}
		<TOC {activeId} bind:showTocMobile article={data.article} bind:articlElement />
	{/if}

	<!-- Main Content -->
	<main class="mx-auto min-w-0 max-w-4xl p-4" transition:fade>
		<Breadcrumbs {crumbs} />
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
					class="absolute -bottom-6 right-0 rounded-sm bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity hover:opacity-100 dark:bg-white dark:text-gray-900"
				>
					{scrollProgress}% read
				</div>
			</div>
		{/if}

		<!-- Title and Meta -->
		<Header article={data.article} />

		<!-- Series List -->
		<Series article={data.article} id="series-top" />

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

		<!-- Series List -->
		<Series article={data.article} id="series-bottom" />
	</main>
</article>
{#if (data.user && data.user.isJohnOwolabiIdogun) || windowWidth >= MOBILE_BREAKPOINT}
	<Dock title="Navigation">
		{#if windowWidth >= MOBILE_BREAKPOINT}
			<TOC {activeId} bind:showTocMobile article={data.article} bind:articlElement />
		{/if}
	</Dock>
{/if}
