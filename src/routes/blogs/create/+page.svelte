<script lang="ts">
	import AnimatedContainer from '$lib/components/animations/AnimatedContainer.svelte';
	import NewArticle from '$lib/components/blog/NewArticle.svelte';
	import Dock from '$lib/components/reusables/Dock.svelte';
</script>

<AnimatedContainer>
	<div class="mx-auto max-w-7xl space-y-8 pt-16">
		<h1 class="text-center text-3xl font-semibold text-gray-800 dark:text-white">
			Create New Article
		</h1>

		<NewArticle />
	</div>
</AnimatedContainer>

<Dock title="Navigation" />
