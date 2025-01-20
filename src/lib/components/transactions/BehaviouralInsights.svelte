<script lang="ts">
	import type { CategoriesData } from '$lib/types/transaction.types';
	import { transformCategoriesToArray } from '$lib/utils/helpers/transactions.helpers';
	import LoadingInsight from '$lib/components/resuables/LoadingInsight.svelte';
	import Empty from '$lib/components/resuables/Empty.svelte';
	import type { ProgressSteps } from '$lib/types/notification.types';

	let {
		categories,
		loading,
		steps
	}: { categories: CategoriesData; loading: boolean; steps: ProgressSteps[] } = $props();

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
				<div class="col-span-full">
					<LoadingInsight
						{steps}
						numBoxes={6}
						containerClass="grid grid-cols-1 gap-3 pr-2 sm:grid-cols-2 sm:gap-4"
					/>
				</div>
			{:else if percentageValues.length === 0}
				<div class="col-span-full">
					<Empty
						title="No insights available yet"
						description="Behavioral insights will be available once you have made a few transactions."
					/>
				</div>
			{:else}
				{#each percentageValues as pv}
					<div class="rounded-lg border border-gray-200 p-3 dark:border-gray-700 sm:p-4">
						<h3 class="text-xs font-medium text-gray-600 dark:text-gray-400 sm:text-sm">
							{pv.title}
						</h3>
						<p class="mt-1 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
							{pv.value}
						</p>
						<p class="mt-1 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
							{pv.description}
						</p>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>
