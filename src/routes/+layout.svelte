<script lang="ts">
	import '$lib/assets/css/dist/tags.min.css';
	import '../app.css';

	import { browser } from '$app/environment';
	import Notifications from '$lib/components/reusables/Notifications.svelte';
	import { clearNotifications } from '$lib/states/notification.svelte';
	import { navigating, page } from '$app/state';
	import PageLoader from '$lib/components/reusables/PageLoader.svelte';
	import PageTransition from '$lib/components/reusables/PageTransition.svelte';
	import { onMount } from 'svelte';
	let { children } = $props();

	let isDark = $state(false);

	// Avoid FOUC by moving theme check to onMount
	onMount(() => {
		isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		const storedTheme = localStorage.getItem('theme');
		if (storedTheme) isDark = storedTheme === 'dark';
	});
</script>

<svelte:window on:beforeunload={clearNotifications} />

<svelte:head>
	<!-- Only include absolutely essential site-wide meta tags -->
	<meta name="author" content="John Owolabi Idogun" />
	<meta name="application-name" content="John Owolabi Idogun" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@sirneij" />
	<meta name="twitter:creator" content="@sirneij" />
	<meta property="og:site_name" content="John Owolabi Idogun" />
	<meta property="og:locale" content="en_US" />
	<meta property="article:author" content="John Owolabi Idogun" />
	<meta name="robots" content="max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

	<link rel="preload" href="/themes/night-owl.min.css" as="style" />
	<link rel="preload" href="/themes/github.min.css" as="style" />

	<link
		rel="stylesheet"
		href="/themes/night-owl.min.css"
		media={isDark ? 'all' : 'not all'}
		data-theme="dark"
	/>
	<link
		rel="stylesheet"
		href="/themes/github.min.css"
		media={!isDark ? 'all' : 'not all'}
		data-theme="light"
	/>
</svelte:head>

{#if navigating.to}
	<PageLoader />
{/if}

<PageTransition key={page.url.href} duration={600}>
	{@render children()}
</PageTransition>

<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:p-4">
	Skip to main content
</a>

{#if browser}
	<Notifications />
{/if}
