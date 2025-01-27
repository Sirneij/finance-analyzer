<script lang="ts">
	import { page } from '$app/state';
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import { slide } from 'svelte/transition';
	import Empty from '$lib/components/reusables/Empty.svelte';
	import Caret from '$lib/components/icons/Caret.svelte';
	import Loader from '../reusables/Loader.svelte';

	let expandedSeries = $state<string | null>(null),
		loadingStates = $state<Record<string, boolean>>({}),
		seriesArticles = $state<Record<string, any[]>>({});

	function formatTitle(title: string) {
		return title
			.split(',')
			.join(', ')
			.split(' ')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	async function toggleSeries(seriesId: string) {
		if (expandedSeries === seriesId) {
			expandedSeries = null;
			return;
		}

		expandedSeries = seriesId;

		if (!seriesArticles[seriesId]) {
			try {
				loadingStates[seriesId] = true;
				const articles = await fetchSeriesArticles(seriesId);
				seriesArticles[seriesId] = articles;
			} catch (error) {
				console.error('Failed to fetch series articles:', error);
			} finally {
				loadingStates[seriesId] = false;
			}
		}
	}

	async function fetchSeriesArticles(seriesId: string) {
		const res = await fetch(`/blogs/api/series/${seriesId}`);
		const data = await res.json();
		return data.articles;
	}
</script>

<AnimatedSection y={40} delay={600} class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-xl font-semibold text-gray-900 dark:text-white">Series</h2>
	</div>

	<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
		{#if page.data.series?.length}
			<div class="space-y-4">
				{#each page.data.series as series}
					<div class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
						<!-- Series Header -->
						<button
							class="flex w-full items-center justify-between bg-gray-50 p-4 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
							onclick={() => toggleSeries(series._id)}
						>
							<div class="flex items-center space-x-4">
								<div>
									<h3 class="font-medium text-gray-900 dark:text-white">
										{formatTitle(series.title)}
									</h3>
								</div>
							</div>
							<div class="flex items-center space-x-2">
								<Caret
									class="h-5 w-5 transform text-gray-500 transition-transform dark:text-gray-400 {expandedSeries ===
									series._id
										? 'rotate-180'
										: ''}"
									trend="down"
								/>
							</div>
						</button>

						<!-- Series Content -->
						{#if expandedSeries === series._id}
							<div
								class="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
								transition:slide
							>
								{#if loadingStates[series._id]}
									<div class="flex justify-center py-4">
										<Loader width={24} message="Loading series articles..." />
									</div>
								{:else if seriesArticles[series._id]?.length}
									<div class="space-y-3">
										{#each seriesArticles[series._id] as article, index}
											<div
												class="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900"
											>
												<div class="flex items-center space-x-3">
													<span class="text-sm font-medium text-gray-500 dark:text-gray-400">
														{index + 1}
													</span>
													<h4 class="font-medium text-gray-900 dark:text-white">
														{article.title}
													</h4>
												</div>
												<div class="flex items-center space-x-2">
													<span class="text-sm text-gray-500 dark:text-gray-400">
														{new Date(article.createdAt).toLocaleDateString()}
													</span>
													<a
														href="/blogs/{article.slug}/{article._id}"
														class="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
													>
														View
													</a>
												</div>
											</div>
										{/each}
									</div>
								{:else}
									<p class="text-center text-gray-500 dark:text-gray-400">
										No articles in this series yet
									</p>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{:else}
			<Empty title="No series found" description="Create your first series" />
		{/if}
	</div>
</AnimatedSection>
