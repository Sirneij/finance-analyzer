<script lang="ts">
	import AnimatedContainer from '$lib/components/animations/AnimatedContainer.svelte';
	import NewArticle from '$lib/components/blog/NewArticle.svelte';
	import ThemeSwitcher from '$lib/components/resuables/ThemeSwitcher.svelte';
	import JI from '$lib/components/logos/JI.svelte';
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

	<AnimatedContainer>
		<div class="mx-auto max-w-7xl space-y-8 pt-16">
			<h1 class="text-center text-3xl font-semibold text-gray-800 dark:text-white">
				Create New Article
			</h1>

			<NewArticle />
		</div>
	</AnimatedContainer>
</div>
