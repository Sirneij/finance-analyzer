<script lang="ts">
	import { browser } from '$app/environment';
	import Notifications from '$lib/components/reusables/Notifications.svelte';
	import { clearNotifications } from '$lib/states/notification.svelte';
	import '$lib/assets/css/dist/tags.min.css';
	import '../app.css';
	let { children } = $props();
</script>

<svelte:window on:beforeunload={clearNotifications} />

<svelte:head>
	<link rel="stylesheet" type="text/css" href="/themes/night-owl.min.css" />
	<link rel="stylesheet" type="text/css" href="/themes/github.min.css" />
</svelte:head>

<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:p-4">
	Skip to main content
</a>

{@render children()}
{#if browser}
	<Notifications />
{/if}
