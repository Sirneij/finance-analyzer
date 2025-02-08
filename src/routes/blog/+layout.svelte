<script lang="ts">
	import ThemeSwitcher from '$lib/components/reusables/ThemeSwitcher.svelte';
	import JI from '$lib/components/logos/JI.svelte';
	import Footer from '$lib/components/about/Footer.svelte';

	let { children } = $props();
</script>

<div class="relative min-h-screen bg-white dark:bg-gray-900" id="main-content">
	<!-- Logo -->
	<div class="fixed -top-4 z-50 flex w-full items-center justify-between px-4">
		<a href="/" class="cursor-pointer" aria-label="Home">
			<JI
				size={100}
				class="text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
			/>
		</a>
		<ThemeSwitcher />
	</div>

	{@render children()}

	<Footer />
</div>
