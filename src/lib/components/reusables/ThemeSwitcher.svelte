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

		// Update stylesheet media queries
		const darkSheet = document.querySelector('link[href*="night-owl"]');
		const lightSheet = document.querySelector('link[href*="github"]');
		if (darkSheet instanceof HTMLLinkElement && lightSheet instanceof HTMLLinkElement) {
			darkSheet.media = isDark ? 'all' : 'not all';
			lightSheet.media = isDark ? 'not all' : 'all';
		}

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
