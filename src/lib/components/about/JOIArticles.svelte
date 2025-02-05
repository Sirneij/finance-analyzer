<script lang="ts">
	import type { IArticlePopulated } from '$lib/types/articles.types';
	import { estimateReadingTime, formatArticleDate } from '$lib/utils/helpers/editor/blogs.helpers';
	import { marked } from 'marked';
	import Caret from '$lib/components/icons/Caret.svelte';
	import Clock from '$lib/components/icons/Clock.svelte';
	import PenNib from '$lib/components/icons/PenNib.svelte';
	import PencilSquare from '$lib/components/icons/PencilSquare.svelte';

	let { articles }: { articles: IArticlePopulated[] } = $props();
</script>

<div class="space-y-12 overflow-hidden" aria-label="Latest Articles">
	<div class="flex items-center justify-between" aria-label="Header">
		<h2 class="text-4xl font-bold tracking-tight text-gray-900 dark:text-white" aria-label="Title">
			Latest <span
				class="bg-linear-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent"
				aria-label="Subtitle"
			>
				Articles
			</span>
		</h2>

		<a
			href="/blogs"
			class="group inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700
           transition-all hover:border-indigo-500 hover:text-indigo-600 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm dark:border-gray-700 dark:text-gray-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
			title="View All Articles"
			aria-label="View All Articles"
		>
			<span>View All Articles</span>
			<Caret
				class="h-3 w-3 transform transition-transform group-hover:translate-x-1 sm:h-4 sm:w-4"
				trend="down"
				style="transform: rotate(-90deg)"
			/>
		</a>
	</div>

	<!-- Featured Article -->
	{#if articles.length > 0}
		<div class="group relative" aria-label="Featured Article">
			<div
				class="bg-linear-to-r absolute inset-0 rounded-2xl from-indigo-600 to-teal-600 opacity-20 transition duration-300 group-hover:opacity-50"
				aria-label="Background"
			></div>
			<a
				href="/blogs/{articles[0].slug}/{articles[0]._id}"
				class="relative flex flex-col rounded-2xl bg-white p-6 transition-all duration-300 hover:scale-[1.01] dark:bg-gray-800"
				aria-label="Featured Article"
			>
				<h3 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
					{articles[0].title}
				</h3>
				<p class="mt-4 line-clamp-2 text-gray-600 dark:text-gray-300" aria-label="Content">
					{@html marked(articles[0].content)}
				</p>
				{#if articles[0].tags?.length}
					<div class="mt-4 flex flex-wrap gap-2">
						{#each articles[0].tags as tag}
							<span class="tag {tag.name}">
								{tag.name}
							</span>
						{/each}
					</div>
				{/if}
				<div class="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
					<span>Written: {formatArticleDate(articles[0].createdAt)}</span>
					<span class="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
					<span>Edited: {formatArticleDate(articles[0].updatedAt)}</span>
					<span class="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
					<span>{estimateReadingTime(articles[0].content)}</span>
				</div>
			</a>
		</div>
	{/if}

	<div class="relative w-full">
		<!-- Scroll container -->
		<div
			class="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pl-4"
			aria-label="Articles"
		>
			{#each articles.slice(1) as article}
				<a
					href="/blogs/{article.slug}/{article._id}"
					class="focus:outline-hidden -ml-4 w-[300px] flex-none transform snap-start rounded-xl bg-gray-100 p-6 transition-all duration-300 first:ml-0 hover:z-10 hover:-translate-y-2 hover:scale-105 hover:bg-gray-200 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-4 dark:bg-gray-800/50 dark:hover:bg-gray-800/70 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-800"
					style="scroll-snap-align: start;"
					aria-label="Article"
				>
					<h3
						class="mb-2 text-xl font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
						aria-label="Title"
					>
						{article.title}
					</h3>
					<div class="mb-4 text-sm text-gray-600 dark:text-gray-400">
						{#if article.tags?.length}
							<div class="mt-3 flex flex-wrap gap-2" aria-label="Tags">
								{#each article.tags as tag}
									<span class="tag {tag.name}" aria-label={tag.name}>
										{tag.name}
									</span>
								{/each}
							</div>
						{/if}
					</div>
					<div class="flex items-center justify-between" aria-label="Dates">
						<div class="flex items-center space-x-3" aria-label="Reading time">
							<div class="flex items-center space-x-1" aria-label="Written date">
								<PenNib class="h-4 w-4 text-gray-500 dark:text-gray-400" />
								<span class="text-sm font-medium text-gray-600 dark:text-gray-400">
									{formatArticleDate(article.createdAt)}
								</span>
							</div>
							<div class="flex items-center space-x-1" aria-label="Edited date">
								<PencilSquare class="h-4 w-4 text-gray-500 dark:text-gray-400" />
								<span class="text-sm font-medium text-gray-600 dark:text-gray-400">
									{formatArticleDate(article.updatedAt)}
								</span>
							</div>
							<div class="flex items-center space-x-1" aria-label="Reading time">
								<Clock class="h-4 w-4 text-gray-500 dark:text-gray-400" />
								<span class="text-sm font-medium text-gray-600 dark:text-gray-400">
									{estimateReadingTime(article.content)}
								</span>
							</div>
						</div>
					</div>
				</a>
			{/each}
		</div>

		<!-- Gradient fades for scroll indication -->
		<div
			class="bg-linear-to-r pointer-events-none absolute inset-y-0 left-0 w-20 from-white dark:from-gray-800"
			aria-label="Gradient"
		></div>
		<div
			class="bg-linear-to-l pointer-events-none absolute inset-y-0 right-0 w-20 from-white dark:from-gray-800"
			aria-label="Gradient"
		></div>
	</div>
</div>
