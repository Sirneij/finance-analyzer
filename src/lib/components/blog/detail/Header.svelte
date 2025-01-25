<script lang="ts">
	import { browser } from '$app/environment';
	import Check from '$lib/components/icons/Check.svelte';
	import Clock from '$lib/components/icons/Clock.svelte';
	import Copy from '$lib/components/icons/Copy.svelte';
	import Delete from '$lib/components/icons/Delete.svelte';
	import Edit from '$lib/components/icons/Edit.svelte';
	import Share from '$lib/components/icons/Share.svelte';
	import { addNotification } from '$lib/states/notification.svelte';
	import type { IArticlePopulated } from '$lib/types/articles.types';
	import { formatDate } from '$lib/utils/helpers/date.helpers';
	import {
		copyUrl,
		estimateReadingTime,
		shareContent
	} from '$lib/utils/helpers/editor/blogs.helpers';

	let {
		article
	}: {
		article: IArticlePopulated;
	} = $props();

	let copySuccess = $state(false);

	// Calculate reading time
	const readingTime = $derived.by(() => estimateReadingTime(article.content));
</script>

<header class="mt-8 space-y-4">
	<div class="flex items-start justify-between">
		<h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
			{article.title}
		</h1>

		<div class="flex gap-2">
			<button
				class="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
				aria-label="Edit article"
			>
				<Edit class="h-5 w-5" />
			</button>
			<button
				class="rounded-full p-2 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
				aria-label="Delete article"
			>
				<Delete class="h-5 w-5" />
			</button>
		</div>
	</div>

	<div class="flex flex-wrap items-center gap-4">
		<!-- Tags -->
		<div class="card-tag flex flex-wrap gap-2 text-gray-800 dark:text-white">
			{#each article.tags as tag}
				<span class="tag {tag.name}">
					{tag.name}
				</span>
			{/each}
		</div>

		<!-- Dates -->
		<div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
			<div class="flex items-center gap-1">
				<Clock class="h-4 w-4" />
				<time>
					Created {formatDate(article.createdAt)}
				</time>
			</div>
			{#if article.updatedAt}
				<div class="flex items-center gap-1">
					<Clock class="h-4 w-4" />
					<time>
						Updated {formatDate(article.updatedAt)}
					</time>
				</div>
			{/if}
		</div>
	</div>
	<div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
		<span>{readingTime}</span>
		<div class="flex gap-2">
			<button
				class="inline-flex items-center gap-1 rounded-full px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
				onclick={async () => {
					copySuccess = await copyUrl();
					if (copySuccess) {
						setTimeout(() => (copySuccess = false), 2000);
					}
				}}
				aria-label="Copy article link"
			>
				{#if copySuccess}
					<Check class="h-4 w-4" />
					Copied!
				{:else}
					<Copy class="h-4 w-4" />
					Copy link
				{/if}
			</button>
			<button
				class="inline-flex items-center gap-1 rounded-full px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"
				onclick={async () => {
					const success = await shareContent({
						title: article.title,
						text: article.content.slice(0, 160),
						url: window.location.href
					});
					if (success && !navigator.share) {
						addNotification(
							'Article details copied because your browser does not support sharing',
							'warning'
						);
						copySuccess = true;
						setTimeout(() => (copySuccess = false), 2000);
					}
				}}
			>
				<Share class="h-4 w-4" />
				{#if browser && !navigator.share && copySuccess}
					Copied!
				{:else}
					Share
				{/if}
			</button>
		</div>
	</div>
</header>
