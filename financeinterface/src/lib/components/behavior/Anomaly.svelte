<script lang="ts">
	import type { Anomaly } from '$lib/types/transaction.types';
	import LoadingInsight from '$lib/components/resuables/LoadingInsight.svelte';
	import { formatDate } from '$lib/utils/helpers/date.helpers';

	let { anomalies, loading }: { anomalies: Anomaly[]; loading: boolean } = $props();
</script>

<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
	<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Suspicious Transactions</h2>
	<div class="max-h-64 space-y-4 overflow-y-auto">
		{#if loading}
			{#each new Array(3) as _, i}
				<LoadingInsight />
			{/each}
		{:else}
			{#each anomalies as anomaly}
				<div class="rounded border-l-4 border-red-500 bg-red-50 p-4 dark:bg-gray-700">
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<p class="text-sm text-gray-600 dark:text-gray-300">
								{formatDate(anomaly.date)}
							</p>
							<p class="mt-1 font-medium text-gray-900 dark:text-white">
								{anomaly.description}
							</p>
						</div>
						<span class="font-semibold text-red-600 dark:text-red-400">
							${Math.abs(anomaly.amount).toLocaleString()}
						</span>
					</div>
					<p class="mt-2 text-sm text-red-600 dark:text-red-400">
						⚠️ {anomaly.reason}
					</p>
				</div>
			{/each}
		{/if}
	</div>
</div>
