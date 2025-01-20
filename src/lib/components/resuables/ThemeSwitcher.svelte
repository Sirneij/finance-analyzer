<script lang="ts">
	import Moon from '$lib/components/icons/Moon.svelte';
	import Sun from '$lib/components/icons/Sun.svelte';

	let { ...props } = $props();

	let isDark = $state(false);

	$effect(() => {
		isDark = document.documentElement.classList.contains('dark');
	});

	function toggleTheme() {
		isDark = !isDark;
		localStorage.setItem('theme', isDark ? 'dark' : 'light');
		document.documentElement.classList.toggle('dark', isDark);
	}
</script>

<button onclick={toggleTheme} {...props}>
	{#if isDark}
		<Sun />
	{:else}
		<Moon />
	{/if}
</button>
