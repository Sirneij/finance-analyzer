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
	} from '$lib/utils/helpers/editor/blog.helpers';
	import Head from '$lib/components/blog/detail/Head.svelte';
	import TOC from '$lib/components/blog/detail/TOC.svelte';
	import Header from '$lib/components/blog/detail/Header.svelte';
	import Series from '$lib/components/blog/detail/Series.svelte';
	import Dock from '$lib/components/reusables/Dock.svelte';
	import BackToTop from '$lib/components/icons/BackToTop.svelte';
	import Breadcrumbs from '$lib/components/reusables/Breadcrumbs.svelte';
	import ArticleImage from '$lib/components/blog/detail/ArticleImage.svelte';
	import { page } from '$app/state';

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

	const crumbs = [
		{ text: 'Blog', href: '/blog' },
		{ text: data.article.title, href: page.url.href }
	];

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
			class="fixed right-4 bottom-20 z-50 rounded-full bg-indigo-600 p-3 text-white shadow-lg transition-opacity duration-200 hover:bg-indigo-700 lg:bottom-8"
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
	<main class="mx-auto max-w-4xl min-w-0 p-4" transition:fade>
		<Breadcrumbs {crumbs} />
		<!-- Skip to content link -->
		<a href="#content" class="sr-only focus:not-sr-only"> Skip to content </a>
		<!-- Cover Image -->
		<ArticleImage article={data.article} />

		<!-- Enhanced reading progress -->
		{#if browser}
			<div
				class="fixed top-0 left-0 z-50 flex h-1 w-full items-center bg-gray-200 dark:bg-gray-800"
			>
				<div
					class="h-full bg-indigo-600 transition-all duration-150 dark:bg-indigo-500"
					style="width: {scrollProgress}%"
				></div>
				<div
					class="absolute right-0 -bottom-6 rounded-sm bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity hover:opacity-100 dark:bg-white dark:text-gray-900"
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
