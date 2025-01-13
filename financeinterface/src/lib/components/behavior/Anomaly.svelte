<script lang="ts">
	import type { Anomaly } from '$lib/types/transaction.types';
	import LoadingInsight from '$lib/components/resuables/LoadingInsight.svelte';
	import { formatDate } from '$lib/utils/helpers/date.helpers';
	import Empty from '$lib/components/resuables/Empty.svelte';
	import type { ProgressSteps } from '$lib/types/notification.types';

	let {
		anomalies,
		loading,
		steps
	}: { anomalies: Anomaly[]; loading: boolean; steps: ProgressSteps[] } = $props();
</script>

<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
	<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Suspicious Transactions</h2>
	<div class="max-h-64 space-y-4 overflow-y-auto">
		{#if loading}
			<LoadingInsight {steps} numBoxes={4} />
		{:else if !anomalies}
			<Empty
				title="No anomalies found"
				description="No suspicious transactions found in your account."
			/>
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
