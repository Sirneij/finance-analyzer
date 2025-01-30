<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import Calendar from '$lib/components/icons/Calendar.svelte';
	import Delete from '$lib/components/icons/Delete.svelte';
	import Empty from '$lib/components/reusables/Empty.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { fade } from 'svelte/transition';
	import { formatArticleDate } from '$lib/utils/helpers/editor/blogs.helpers';
	import AnimatedContainer from '$lib/components/animations/AnimatedContainer.svelte';
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import Paginations from '$lib/components/reusables/Paginations.svelte';
	import type { IArticlePopulated } from '$lib/types/articles.types';
	import { addNotification } from '$lib/states/notification.svelte';

	let { data } = $props();

	let hoveredArticle = $state<string | null>(null),
		selectedArticles = $state<Set<string>>(new Set());

	function toggleAll(event: Event) {
		const checked = (event.target as HTMLInputElement).checked;
		selectedArticles = new Set(checked ? data.articles.map((a: IArticlePopulated) => a._id) : []);
	}

	function toggleSelection(id: string) {
		const newSet = new Set(selectedArticles);
		if (newSet.has(id)) {
			newSet.delete(id);
		} else {
			newSet.add(id);
		}
		selectedArticles = newSet;
	}

	const handleDelete: SubmitFunction = async () => {
		return async ({ result, update }) => {
			if (result.type === 'success' || result.type === 'redirect') {
				selectedArticles = new Set();
				addNotification('The selected article(s) have been deleted successfully.', 'success');
				await update();
			}
			await applyAction(result);
		};
	};

	const handleTogglePublish: SubmitFunction = async () => {
		return async ({ result, update }) => {
			if (result.type === 'success' || result.type === 'redirect') {
				selectedArticles = new Set();
				addNotification('The selected article(s) have been toggled successfully.', 'success');
				await update();
			}
			await applyAction(result);
		};
	};
</script>

<AnimatedContainer class="container mx-auto min-h-screen w-full space-y-4 p-6">
	<AnimatedSection y={30} identifier={data.metadata.page}>
		<!-- Header Card with Actions -->
		<div class="mt-12 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
			<div class="flex items-center justify-between">
				<AnimatedSection y={20}>
					<h2 class="text-xl font-semibold text-gray-900 dark:text-white">Articles</h2>
					<p class="text-sm text-gray-600 dark:text-gray-400">Manage your blog articles</p>
				</AnimatedSection>

				{#if selectedArticles.size > 0}
					<div class="flex gap-2">
						<form method="POST" action="?/togglePublish" use:enhance={handleTogglePublish}>
							<input type="hidden" name="articles" value={Array.from(selectedArticles).join(',')} />
							<button
								class="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-indigo-600 transition-colors hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
								type="submit"
								transition:fade
							>
								Toggle Publish ({selectedArticles.size})
							</button>
						</form>

						<form method="POST" action="?/deleteArticles" use:enhance={handleDelete}>
							<input
								type="hidden"
								name="articleIds"
								value={Array.from(selectedArticles).join(',')}
							/>
							<button
								class="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
								type="submit"
								transition:fade
							>
								<Delete class="h-5 w-5" />
								Delete Selected ({selectedArticles.size})
							</button>
						</form>
					</div>
				{/if}
			</div>
		</div>

		<!-- Table -->
		<div class="rounded-lg bg-white shadow-sm dark:bg-gray-800">
			<div class="w-full overflow-x-auto">
				<table class="w-full text-left text-sm">
					<thead class="sticky top-0 bg-gray-50 text-center text-xs uppercase dark:bg-gray-700">
						<tr>
							<th class="px-6 py-4 text-left">
								<input
									type="checkbox"
									class="rounded border-gray-100 bg-gray-200 text-indigo-600 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800"
									onchange={toggleAll}
									checked={selectedArticles.size === data.articles.length &&
										data.articles.length > 0}
								/>
							</th>
							<th class="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">
								<div class="flex items-center space-x-2">
									<span>Published</span>
								</div>
							</th>
							<th class="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">Title</th>
							<th class="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">Views</th>
							<th class="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">
								<div class="flex items-center space-x-2">
									<span>Date</span>
									<Calendar class="h-4 w-4" />
								</div>
							</th>
							<th></th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100 dark:divide-gray-700">
						{#each data.articles as article}
							<tr
								class="group relative transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
								onmouseenter={() => (hoveredArticle = article._id)}
								onmouseleave={() => (hoveredArticle = null)}
							>
								<td class="px-6 py-4">
									<input
										type="checkbox"
										class="rounded border-gray-100 bg-gray-200 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
										checked={selectedArticles.has(article._id)}
										onchange={() => toggleSelection(article._id)}
									/>
								</td>
								<td class="whitespace-nowrap px-6 py-4">
									<span
										class={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${article.isPublished ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'}`}
									>
										{article.isPublished ? 'Published' : 'Draft'}
									</span>
								</td>
								<td class="px-6 py-4">
									<a
										href="/blogs/{article.slug}/{article._id}"
										class="font-medium text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
									>
										{article.title}
									</a>
								</td>
								<td class="whitespace-nowrap px-6 py-4 text-gray-600 dark:text-gray-400">
									{article.views}
								</td>
								<td class="whitespace-nowrap px-6 py-4 text-gray-600 dark:text-gray-400">
									{formatArticleDate(article.updatedAt)}
								</td>
								<td>
									{#if hoveredArticle === article._id && !selectedArticles.size}
										<form method="POST" action="?/deleteArticles" use:enhance={handleDelete}>
											<input type="hidden" name="articleIds" value={article._id} />
											<button
												class="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100 dark:hover:bg-gray-700 dark:hover:text-gray-300"
												type="submit"
												aria-label="Delete article"
											>
												<Delete class="h-4 w-4" />
											</button>
										</form>
									{/if}
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="5">
									<div class="flex items-center justify-center p-4">
										<Empty
											title="No articles available"
											description="You haven't written any articles yet."
										/>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</AnimatedSection>
	<Paginations metadata={data.metadata} />
</AnimatedContainer>
