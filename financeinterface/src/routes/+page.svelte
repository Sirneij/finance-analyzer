<script lang="ts">
	import AnimatedContainer from '$lib/components/animations/AnimatedContainer.svelte';
	import ThemeSwitcher from '$lib/components/resuables/ThemeSwitcher.svelte';
	import SEO from '$lib/components/about/SEO.svelte';
	import Profile from '$lib/components/about/Profile.svelte';
	import GitHubOverview from '$lib/components/about/GitHubOverview.svelte';
	import TopRepos from '$lib/components/about/TopRepos.svelte';
	import Hero from '$lib/components/about/Hero.svelte';
	import Articles from '$lib/components/about/Articles.svelte';
	import type { ProcessedDevToArticles } from '$lib/types/dev.to.types.js';
	import type { PageData } from './$types';
	import JI from '$lib/components/logos/JI.svelte';

	let { data }: { data: PageData } = $props();

	let devtoArticles: ProcessedDevToArticles | null = $state(null);
</script>

<SEO {data} />

<div
	class="min-h-screen bg-white p-8 text-gray-900 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 dark:text-gray-100"
>
	<!-- Logo -->
	<div class="fixed left-4 top-4 z-50">
		<a href="/" class="cursor-pointer" aria-label="Home">
			<JI
				size={48}
				class="text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
			/>
		</a>
	</div>

	<!-- Theme Switcher -->
	<div class="fixed right-4 top-4 z-50">
		<ThemeSwitcher />
	</div>
	<AnimatedContainer class="mx-auto max-w-4xl space-y-24">
		<!-- Hero Section -->
		<Hero githubUser={data.githubData.user} />

		<!-- Profile Section -->
		<Profile {data} />

		<!-- GitHub Overview -->
		<GitHubOverview githubUser={data.githubData.user} bind:devtoArticles />

		<!-- Top Repos -->
		<TopRepos topRepos={data.githubData.topRepos} />

		<Articles bind:devtoArticles />
	</AnimatedContainer>
</div>
