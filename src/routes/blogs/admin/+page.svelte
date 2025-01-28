<script lang="ts">
	import AnimatedContainer from '$lib/components/animations/AnimatedContainer.svelte';
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import { MetricsIcons } from '$lib/components/icons';
	import TagMgt from '$lib/components/admin/TagMGT.svelte';
	import SeriesMgt from '$lib/components/admin/SeriesMGT.svelte';
	import Dock from '$lib/components/reusables/Dock.svelte';

	let { data } = $props();

	const metrics = $derived.by(() => {
		const res = {
			totalArticles: data.stats.totalArticles,
			totalViews: data.stats.totalViews,
			totalReactions: data.stats.totalReactions,
			totalSeries: data.seriesMetadata.total,
			totalTags: data.tagsMetadata.total
		};

		return res;
	});
</script>

<AnimatedContainer class="container mx-auto min-h-screen p-6">
	<!-- Header Section -->
	<AnimatedSection y={20} class="mb-8 mt-20 md:mt-0">
		<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
		<p class="text-gray-600 dark:text-gray-400">Manage content, tags, and series</p>
	</AnimatedSection>

	<!-- Metrics Cards -->
	<AnimatedSection y={30} delay={200} class="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
		{#each Object.entries(metrics) as [key, value]}
			{@const Icon = MetricsIcons[key as keyof typeof MetricsIcons]}
			<div
				class="rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-gray-800"
			>
				<div class="flex items-center justify-between">
					<h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
						{key
							.replace('total', '')
							.replace(/([A-Z])/g, ' $1')
							.trim()}
					</h3>
					<Icon class="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
				</div>
				<p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
			</div>
		{/each}
	</AnimatedSection>

	<!-- Content Management -->
	<div class="flex w-full flex-col space-y-8">
		<!-- Tags Management -->
		<TagMgt />

		<!-- Series Management -->
		<SeriesMgt />
	</div>
</AnimatedContainer>

<Dock title="Navigation" />
