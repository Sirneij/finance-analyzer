<script lang="ts">
	import type { IArticlePopulated } from '$lib/types/articles.types';
	import {
		capitalize,
		truncateSeriesArticles,
		truncateTitle
	} from '$lib/utils/helpers/editor/blogs.helpers';
	import { onMount } from 'svelte';

	let { article }: { article: IArticlePopulated } = $props();

	let seriesArticles = $state([] as IArticlePopulated[]),
		showAllSeries = $state(false),
		innerWidth = $state(0);
	$effect(() => {
		onMount(async () => {
			if (article.series) {
				const res = await fetch(`/blogs/api/series/${article.series._id}`);
				const data = await res.json();
				// Sort the series articles by their createdAt date
				seriesArticles = data.articles.sort((a: IArticlePopulated, b: IArticlePopulated) => {
					return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
				});
			}
		});
	});

	const seriesDisplay = $derived.by(() => truncateSeriesArticles(seriesArticles, showAllSeries));
</script>

<svelte:window bind:innerWidth />

{#if article.series && seriesArticles.length > 1}
	<div class="mt-8 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
		<h2 class="text-lg font-semibold text-gray-900 dark:text-white">
			{capitalize(article.series.title)} Series
		</h2>
		<div class="mt-4 space-y-2">
			{#each seriesDisplay as sArticle, i}
				{#if sArticle._id === 'ellipsis'}
					<button
						class="w-full rounded-md p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
						onclick={() => (showAllSeries = true)}
					>
						<span
							class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-sm font-medium dark:bg-gray-700"
						>
							...
						</span>
						<span
							class="ml-2 text-gray-600 dark:text-gray-400"
							title={sArticle.title}
							aria-label={sArticle.title}
						>
							{truncateTitle(sArticle.title, innerWidth)}
						</span>
					</button>
				{:else}
					<a
						href="/blogs/{article.slug}/{sArticle._id}"
						class="block rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-800 {sArticle._id ===
						article._id
							? 'bg-indigo-50 dark:bg-indigo-900/20'
							: ''}"
					>
						<span
							class="inline-flex h-6 w-6 items-center justify-center rounded-full {sArticle._id ===
							article._id
								? 'bg-indigo-200 dark:bg-indigo-800'
								: 'bg-gray-200 dark:bg-gray-700'}"
						>
							{i + 1}
						</span>
						<span
							class="ml-2 {sArticle._id === article._id
								? 'font-medium text-indigo-600 dark:text-indigo-400'
								: 'text-gray-600 dark:text-gray-400'}"
							title={sArticle.title}
							aria-label={sArticle.title}
						>
							{truncateTitle(sArticle.title, innerWidth)}
						</span>
					</a>
				{/if}
			{/each}
		</div>
	</div>
{/if}
