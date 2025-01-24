<script lang="ts">
	import '$lib/assets/css/dist/tags.min.css';
	import ThemeSwitcher from '$lib/components/reusables/ThemeSwitcher.svelte';
	import JI from '$lib/components/logos/JI.svelte';
	import Footer from '$lib/components/about/Footer.svelte';

	let { children } = $props();
</script>

<div class="relative min-h-screen bg-white dark:bg-gray-900">
	<!-- Logo -->
	<div class="fixed left-4 top-4 z-50">
		<a href="/" class="cursor-pointer" aria-label="Home">
			<JI
				size={40}
				class="text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
			/>
		</a>
	</div>

	<ThemeSwitcher
		class="absolute right-4 top-4 z-50 cursor-pointer rounded-full bg-white p-2 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-700 dark:ring-2"
	/>

	{@render children()}

	<Footer />
</div>
