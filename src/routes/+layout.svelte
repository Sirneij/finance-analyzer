<script lang="ts">
	import { browser } from '$app/environment';
	import Notifications from '$lib/components/reusables/Notifications.svelte';
	import { clearNotifications } from '$lib/states/notification.svelte';
	import '$lib/assets/css/dist/tags.min.css';
	import '../app.css';
	let { children } = $props();

	let isDark = browser ? localStorage.getItem('theme') === 'dark' : false;
</script>

<svelte:window on:beforeunload={clearNotifications} />

<svelte:head>
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

<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:p-4">
	Skip to main content
</a>

{@render children()}
{#if browser}
	<Notifications />
{/if}
