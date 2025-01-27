<script lang="ts">
	import type { ProcessedDevToArticles } from '$lib/types/dev.to.types';
	import { fetchAndProcessDevToArticles } from '$lib/utils/helpers/dev.to.helpers';
	import { onMount } from 'svelte';
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import Caret from '$lib/components/icons/Caret.svelte';
	import Article from '$lib/components/about/mini/Article.svelte';
	import LoadingArticles from '$lib/components/about/mini/LoadingArticles.svelte';
	import { SLIDE_DURATION } from '$lib/utils/helpers/misc.transitions';
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { HTMLAttributes } from 'svelte/elements';
	import Devto from '$lib/components/icons/Devto.svelte';

	interface ArticlesSectionProps extends HTMLAttributes<HTMLElement> {
		devtoArticles: ProcessedDevToArticles | null;
	}

	let { devtoArticles = $bindable(), ...props }: ArticlesSectionProps = $props();

	let isLoading = $state(true),
		error = $state<string | null>(null),
		activeSeries: string | null = $state(null);

	function toggleSeries(seriesName: string) {
		activeSeries = activeSeries === seriesName ? null : seriesName;
	}

	onMount(async () => {
		try {
			devtoArticles = await fetchAndProcessDevToArticles();
		} catch (e) {
			error = 'Failed to load blog posts';
			console.error(e);
		} finally {
			isLoading = false;
		}
	});
</script>

<AnimatedSection class="space-y-12" y={50} delay={300} {...props}>
	<div class="mb-8 flex items-center gap-3">
		<Devto class="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
		<h2 class="text-3xl font-semibold">Dev.to Articles</h2>
	</div>

	{#if isLoading}
		<LoadingArticles />
	{:else if error}
		<div class="rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/50 dark:text-red-200">
			{error}
		</div>
	{:else if devtoArticles}
		<!-- Series Posts -->
		{#if Object.entries(devtoArticles.series).length > 0}
			<div class="space-y-2">
				{#each Object.entries(devtoArticles.series) as [seriesName, articles] (seriesName)}
					<div class="rounded-xl bg-gradient-to-br from-indigo-500/30 to-teal-500/30">
						<div class="rounded-xl bg-gray-100 dark:bg-gray-800/50">
							<!-- Series Header -->
							<button
								onclick={() => toggleSeries(seriesName)}
								class="flex w-full items-center justify-between p-4 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-800"
							>
								<h3 class="text-xl font-semibold">{seriesName}</h3>
								<Caret
									trend="down"
									class="h-6 w-6 transform transition-transform duration-300"
									style={activeSeries === seriesName ? '' : 'transform: rotate(-90deg)'}
								/>
							</button>

							<!-- Series Articles -->
							{#if activeSeries === seriesName}
								<div
									transition:slide={{ duration: SLIDE_DURATION, easing: cubicOut }}
									class="relative w-full"
								>
									<div
										class="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pl-4"
									>
										{#each articles as article, index}
											<div
												in:slide={{
													delay: index * 100,
													duration: SLIDE_DURATION,
													easing: cubicOut
												}}
											>
												<Article
													{article}
													class="w-[300px] flex-none transform snap-start rounded-lg transition-all duration-300 hover:-translate-y-2 hover:scale-105"
												/>
											</div>
										{/each}
									</div>
									<!-- Gradient fades -->
									<div
										class="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white dark:from-gray-800"
									></div>
									<div
										class="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white dark:from-gray-800"
									></div>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Standalone Posts -->
		{#if devtoArticles.standalone.length > 0}
			<div class="mt-12">
				<h3 class="mb-6 text-2xl font-semibold">Standalone Articles</h3>
				<div class="relative w-full">
					<div class="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pl-4">
						{#each devtoArticles.standalone as article}
							<Article
								{article}
								class="group w-[350px] flex-none transform snap-start rounded-xl bg-gradient-to-br from-indigo-500/30 to-teal-500/30 p-[1px] transition-all duration-500 hover:-translate-y-1 hover:scale-105"
							/>
						{/each}
					</div>
					<!-- Gradient fades -->
					<div
						class="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white dark:from-gray-800"
					></div>
					<div
						class="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white dark:from-gray-800"
					></div>
				</div>
			</div>
		{/if}
	{/if}
</AnimatedSection>

<style>
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
