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

<div class="h-[220px] rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
	<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Behavioral Insights</h2>
	<div class="overflow-x-auto">
		<div class="flex gap-4 pb-2">
			{#if loading}
				{#each Array(4) as _, i}
					<LoadingInsight />
				{/each}
			{:else if percentageValues.length === 0}
				<Empty
					title="No insights available yet"
					description="Behavioral insights will be available once you have made a few transactions."
				/>
			{:else}
				{#each percentageValues as pv}
					<div class="min-w-[200px] rounded-lg border border-gray-200 p-4 dark:border-gray-700">
						<h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">
							{pv.title}
						</h3>
						<p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
							{pv.value}
						</p>
						<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{pv.description}</p>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>
