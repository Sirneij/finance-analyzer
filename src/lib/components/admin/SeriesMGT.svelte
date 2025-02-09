<script lang="ts">
	import { page } from '$app/state';
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import { slide } from 'svelte/transition';
	import Empty from '$lib/components/reusables/Empty.svelte';
	import Caret from '$lib/components/icons/Caret.svelte';
	import Loader from '$lib/components/reusables/Loader.svelte';
	import SeriesArticle from '$lib/components/admin/mini/SeriesArticle.svelte';
	import SeriesArticleHeader from './mini/SeriesArticleHeader.svelte';
	import { fetchSeriesArticles } from '$lib/utils/helpers/editor/blog.helpers';
	import type { IArticlePopulated, IArticleSeries } from '$lib/types/articles.types';
	import { enhance } from '$app/forms';
	import Checkbox from '$lib/components/forms/Checkbox.svelte';
	import Delete from '$lib/components/icons/Delete.svelte';
	import FormError from '$lib/components/reusables/FormError.svelte';

	let expandedSeries = $state<string | null>(null),
		loadingStates = $state<Record<string, boolean>>({}),
		seriesArticles = $state<Record<string, IArticlePopulated[]>>({}),
		selectedSeries = $state<Set<string>>(new Set());

	function formatTitle(title: string) {
		return title
			.split(',')
			.join(', ')
			.split(' ')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	function toggleAll(event: Event) {
		const checked = (event.target as HTMLInputElement).checked;
		selectedSeries = new Set(checked ? page.data.series?.map((s: IArticleSeries) => s._id) : []);
	}

	function toggleSelection(id: string) {
		const newSet = new Set(selectedSeries);
		if (newSet.has(id)) {
			newSet.delete(id);
		} else {
			newSet.add(id);
		}
		selectedSeries = newSet;
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
</script>

<AnimatedSection y={40} delay={600} class="space-y-6">
	<FormError form={page.form} />
	<div class="flex items-center justify-between">
		<h2 class="text-xl font-semibold text-gray-900 dark:text-white">Series</h2>
		<!-- Bulk Actions -->
		{#if page.data.series?.length}
			<div class="flex items-center space-x-4">
				<Checkbox
					showLabel={true}
					onchange={toggleAll}
					label="Select All"
					checked={selectedSeries.size === page.data.series.length && page.data.series.length > 0}
				/>

				{#if selectedSeries.size > 0}
					<form
						method="POST"
						action="?/deleteSeries"
						use:enhance={() => {
							return async ({ result, update }) => {
								if (result.type === 'success') {
									selectedSeries.clear();
									await update();
								}
							};
						}}
						class="flex items-center space-x-2"
					>
						<input type="hidden" name="ids" value={Array.from(selectedSeries).join(',')} />
						<span class="text-sm text-gray-500">
							{selectedSeries.size} selected
						</span>
						<button
							type="submit"
							class="rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200"
						>
							Delete Selected
						</button>
					</form>
				{/if}
			</div>
		{/if}
	</div>

	<div class="shadow-xs rounded-lg bg-white p-6 dark:bg-gray-800">
		{#if page.data.series?.length}
			<div class="space-y-4">
				{#each page.data.series as series}
					<div
						class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
						transition:slide
					>
						<!-- Series Header -->
						<div class="flex w-full items-center justify-between bg-gray-50 p-4 dark:bg-gray-800">
							<div class="flex items-center space-x-4">
								<Checkbox
									checked={selectedSeries.has(series._id)}
									onchange={() => toggleSelection(series._id)}
									label={series.title}
								/>
								<button
									type="button"
									class="flex items-center space-x-4"
									onclick={() => toggleSeries(series._id)}
								>
									<h3 class="font-medium text-gray-900 dark:text-white">
										{formatTitle(series.title)}
									</h3>
								</button>
							</div>
							<div class="flex items-center space-x-2">
								<a
									href="/blog/admin/#"
									class="pointer-events-none text-blue-600 hover:text-blue-700"
									title="Edit series"
								>
									Edit
								</a>
								<form method="POST" action="?/deleteSeries" use:enhance class="inline">
									<input type="hidden" name="ids" value={series._id} />
									<button
										type="submit"
										class="text-red-600 hover:text-red-700"
										title="Delete series"
									>
										<Delete class="h-5 w-5" />
									</button>
								</form>
								<Caret
									class="h-5 w-5 transform text-gray-500 transition-transform dark:text-gray-400 {expandedSeries ===
									series._id
										? 'rotate-180'
										: ''}"
									trend="down"
								/>
							</div>
						</div>

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
									<SeriesArticleHeader />
									<div class="space-y-3">
										{#each seriesArticles[series._id] as article, index}
											<SeriesArticle {article} {index} />
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
