<script lang="ts">
	import Comments from '$lib/components/icons/Comments.svelte';
	import Hearts from '$lib/components/icons/Hearts.svelte';
	import type { DevToArticle, SeriesDevToArticle } from '$lib/types/dev.to.types';
	import type { HTMLAttributes } from 'svelte/elements';

	interface ArticleProps extends HTMLAttributes<HTMLElement> {
		article: DevToArticle | SeriesDevToArticle;
	}

	let { article, ...props }: ArticleProps = $props();

	function isSeriesArticle(
		article: DevToArticle | SeriesDevToArticle
	): article is SeriesDevToArticle {
		return 'series' in article && 'part' in article;
	}
</script>

<div {...props}>
	<a
		href={article.url}
		target="_blank"
		rel="noopener noreferrer"
		class="block h-full rounded-xl bg-gray-100 dark:bg-gray-800/50"
	>
		{#if article.cover_image}
			<img src={article.cover_image} alt="" class="h-48 w-full rounded-t-xl object-cover" />
		{/if}
		<div class="p-4">
			{#if !isSeriesArticle(article)}
				<h4 class="mb-2 text-lg font-medium">{article.title}</h4>
				<p class="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
					{article.description}
				</p>
			{:else}
				<span
					class="mb-2 inline-block rounded bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200"
				>
					Part: {article.part}
				</span>
				<h4 class="line-clamp-2 text-lg font-medium">
					{article.part}
				</h4>
			{/if}

			<div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
				<span>{article.reading_time_minutes} min read</span>
				<div class="flex items-center space-x-2">
					<span class="flex items-center space-x-1">
						<Hearts class="mr-1 h-4 w-4 text-red-500 dark:text-red-400" />
						{article.public_reactions_count}
					</span>
					<span class="flex items-center space-x-1">
						<Comments class="mr-1 h-4 w-4 text-gray-500 dark:text-gray-400" />
						{article.comments_count}
					</span>
				</div>
			</div>
		</div>
	</a>
</div>
