<script lang="ts">
	import Moon from '$lib/components/icons/Moon.svelte';
	import Sun from '$lib/components/icons/Sun.svelte';
	import { changeCodeBlockTheme } from '$lib/utils/helpers/docs.helpers';

	let { ...props } = $props();
	let isDark = $state(false);

	$effect(() => {
		isDark = document.documentElement.classList.contains('dark');
		changeCodeBlockTheme(isDark ? 'night-owl' : 'github');
	});

	function toggleTheme() {
		isDark = !isDark;
		localStorage.setItem('theme', isDark ? 'dark' : 'light');
		document.documentElement.classList.toggle('dark', isDark);
		// Ensure theme change after DOM update
		requestAnimationFrame(() => {
			changeCodeBlockTheme(isDark ? 'night-owl' : 'github');
		});
	}
</script>

<button
	onclick={toggleTheme}
	aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
	{...props}
>
	{#if isDark}
		<Sun />
	{:else}
		<Moon />
	{/if}
</button>
