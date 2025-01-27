<script lang="ts">
	import { browser } from '$app/environment';
	import { applyAction, enhance } from '$app/forms';
	import Check from '$lib/components/icons/Check.svelte';
	import Clock from '$lib/components/icons/Clock.svelte';
	import Copy from '$lib/components/icons/Copy.svelte';
	import Delete from '$lib/components/icons/Delete.svelte';
	import Edit from '$lib/components/icons/Edit.svelte';
	import Share from '$lib/components/icons/Share.svelte';
	import ModelessDialog from '$lib/components/reusables/ModelessDialog.svelte';
	import { addNotification } from '$lib/states/notification.svelte';
	import type { IArticlePopulated } from '$lib/types/articles.types';
	import { formatDate } from '$lib/utils/helpers/date.helpers';
	import {
		copyUrl,
		estimateReadingTime,
		shareContent
	} from '$lib/utils/helpers/editor/blogs.helpers';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { article }: { article: IArticlePopulated } = $props();

	let copySuccess = $state(false),
		triggerButton = $state<HTMLButtonElement>(),
		isSubmitted = $state(false),
		isOpen = $state(false);
	// Calculate reading time
	const readingTime = $derived.by(() => estimateReadingTime(article.content));

	function confirmDelete() {
		isSubmitted = true;
		// triggerButton?.form?.requestSubmit();
		triggerButton?.click();
	}

	function onClose() {
		isOpen = false;
	}

	const handleDelete: SubmitFunction = async ({ cancel }) => {
		// Prevent form submission
		if (!isSubmitted) {
			isOpen = true;
			cancel();
		}

		return async ({ result, update }) => {
			if (result.type === 'success' || result.type === 'redirect') {
				addNotification('Article deleted successfully', 'success');
				await update();
			}
			await applyAction(result);
		};
	};
</script>

<header class="mt-8 space-y-4">
	<div class="flex items-start justify-between">
		<h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
			{article.title}
		</h1>

		<form method="POST" use:enhance={handleDelete} class="flex gap-2">
			<a
				href="/blogs/{article.slug}/{article._id}/edit"
				class=" rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
				aria-label="Edit article"
			>
				<Edit class="h-5 w-5" />
			</a>
			<input type="hidden" name="article-id" value={article._id} />
			<button
				bind:this={triggerButton}
				type="submit"
				class="rounded-full p-2 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
				aria-label="Delete article"
				formaction="/blogs/{article.slug}/{article._id}?/deleteArticle"
			>
				<Delete class="h-5 w-5" />
			</button>
		</form>
	</div>

	<div class="flex flex-wrap items-center gap-4">
		<!-- Tags -->
		<div class="flex flex-wrap gap-2">
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

<ModelessDialog {isOpen} {onClose} title="Delete article?" triggerEl={triggerButton}>
	<p class="mb-2 text-gray-700 dark:text-gray-300">
		Are you sure you want to delete this article? This action cannot be undone.
	</p>

	<button
		type="button"
		onclick={confirmDelete}
		class="rounded bg-rose-600 px-4 py-1 text-sm font-medium text-white transition-all hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600"
	>
		Confirm
	</button>
	<button
		type="button"
		onclick={() => {
			isSubmitted = false;
			isOpen = false;
		}}
		class="rounded bg-gray-100 px-4 py-1 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
	>
		Cancel
	</button>
</ModelessDialog>
