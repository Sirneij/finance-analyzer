<script lang="ts">
	import { page } from '$app/state';
	import AnimatedContainer from '$lib/components/animations/AnimatedContainer.svelte';
	import NewArticle from '$lib/components/blog/NewArticle.svelte';
	import Dock from '$lib/components/reusables/Dock.svelte';
</script>

<svelte:head>
	<title>Create New Article</title>
	<meta name="description" content="Create a new article on John Owolabi's blog" />
	<meta name="robots" content="noindex, nofollow" />
	<meta name="author" content="John Owolabi Idogun" />
</svelte:head>

<AnimatedContainer>
	<div class="mx-auto max-w-7xl space-y-8 pt-16">
		<h1 class="text-center text-3xl font-semibold text-gray-800 dark:text-white">
			Create New Article
		</h1>

		<NewArticle />
	</div>
</AnimatedContainer>

{#if page.data.user && page.data.user.isJohnOwolabiIdogun}
	<Dock title="Navigation" />
{/if}
