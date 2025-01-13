<script lang="ts">
	import type { CategoriesData } from '$lib/types/transaction.types';
	import { transformCategoriesToArray } from '$lib/utils/helpers/transactions.helpers';
	import LoadingInsight from '$lib/components/resuables/LoadingInsight.svelte';
	import Empty from '$lib/components/resuables/Empty.svelte';

	let { categories, loading }: { categories: CategoriesData; loading: boolean } = $props();

	let percentageValues: {
		title: string;
		value: string;
		description: string;
	}[] = $state([]);

	$effect(() => {
		if (loading) return;
		if (!categories) return;
		percentageValues = transformCategoriesToArray(categories);
	});
</script>

<div class="group relative rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
	<h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Behavioral Insights</h3>

	<div class="h-64 overflow-y-auto">
		<div class="grid grid-cols-1 gap-3 pr-2 sm:grid-cols-2 sm:gap-4">
			{#if loading}
				{#each Array(2) as _, i}
					<LoadingInsight />
				{/each}
			{:else if percentageValues.length === 0}
				<div class="col-span-full">
					<Empty
						title="No insights available yet"
						description="Behavioral insights will be available once you have made a few transactions."
					/>
				</div>
			{:else}
				{#each percentageValues as pv}
					<div class="rounded-lg border border-gray-200 p-3 sm:p-4 dark:border-gray-700">
						<h3 class="text-xs font-medium text-gray-600 sm:text-sm dark:text-gray-400">
							{pv.title}
						</h3>
						<p class="mt-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
							{pv.value}
						</p>
						<p class="mt-1 text-xs text-gray-600 sm:text-sm dark:text-gray-400">
							{pv.description}
						</p>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>
