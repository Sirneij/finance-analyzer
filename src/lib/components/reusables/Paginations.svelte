<script lang="ts">
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import { calculateVisiblePages, handlePageChange } from '$lib/utils/commons';

	let {
		metadata
	}: { metadata: { page: number; totalPages: number; limit: number; total: number } } = $props();

	let visiblePages = $state<(number | string)[]>([]);

	$effect(() => {
		visiblePages = calculateVisiblePages(metadata.page, metadata.totalPages);
	});
</script>

<AnimatedSection
	y={40}
	delay={200}
	identifier={metadata.page}
	class="mt-4 rounded-lg bg-white shadow-sm dark:bg-gray-800"
>
	<div class="flex flex-col items-center justify-between gap-4 p-4 sm:flex-row">
		<!-- Results counter -->
		<div class="text-sm text-gray-600 dark:text-gray-400">
			Showing {(metadata.page - 1) * metadata.limit + 1} to {Math.min(
				metadata.page * metadata.limit,
				metadata.total
			)} of {metadata.total} results
		</div>

		<!-- Pagination controls -->
		<div class="flex items-center space-x-1">
			<button
				class="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
				disabled={metadata.page === 1}
				onclick={() => handlePageChange(metadata.page - 1)}
			>
				<svg class="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
				Previous
			</button>

			<div class="hidden sm:flex sm:items-center sm:space-x-1">
				{#each visiblePages as pageNum}
					{#if pageNum === '...'}
						<span class="px-2 text-gray-500 dark:text-gray-400">...</span>
					{:else}
						<button
							class="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors {metadata.page ===
							pageNum
								? 'bg-indigo-600 text-white hover:bg-indigo-700'
								: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}"
							onclick={() => handlePageChange(pageNum as number)}
						>
							{pageNum}
						</button>
					{/if}
				{/each}
			</div>
			<button
				class="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
				disabled={metadata.page === metadata.totalPages}
				onclick={() => handlePageChange(metadata.page + 1)}
			>
				Next
				<svg class="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</button>
		</div>
	</div>
</AnimatedSection>
