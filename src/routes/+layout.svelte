<script lang="ts">
	import { browser } from '$app/environment';
	import Notifications from '$lib/components/reusables/Notifications.svelte';
	import { clearNotifications } from '$lib/states/notification.svelte';
	import '../app.css';
	let { children } = $props();
</script>

<svelte:window on:beforeunload={clearNotifications} />

<svelte:head>
	<link rel="stylesheet" type="text/css" href="/themes/night-owl.min.css" />
	<link rel="stylesheet" type="text/css" href="/themes/github.min.css" />
</svelte:head>

{@render children()}
{#if browser}
	<Notifications />
{/if}
