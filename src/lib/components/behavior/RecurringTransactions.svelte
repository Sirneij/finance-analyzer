<script lang="ts">
	import type { RecurringTransaction } from '$lib/types/transaction.types';
	import type { ProgressSteps } from '$lib/types/notification.types';
	import LoadingInsight from '$lib/components/reusables/LoadingInsight.svelte';
	import Empty from '$lib/components/reusables/Empty.svelte';
	import { formatCurrency } from '$lib/utils/helpers/money.helpers.svelte';

	let {
		transactions,
		loading,
		steps
	}: { transactions: RecurringTransaction[]; loading: boolean; steps: ProgressSteps[] } = $props();
</script>

<div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
	<h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Recurring Transactions</h3>

	{#if loading}
		<LoadingInsight {steps} numBoxes={3} />
	{:else if !transactions?.length}
		<Empty
			title="No recurring transactions"
			description="We haven't detected any recurring transactions yet."
		/>
	{:else}
		<div class="space-y-4">
			{#each transactions as transaction}
				<div class="flex items-center justify-between rounded-md border p-3 dark:border-gray-700">
					<div class="flex-1">
						<p class="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
						<p class="text-sm text-gray-500 dark:text-gray-400">
							{transaction.frequency} • {transaction.confidence} confidence
						</p>
					</div>
					<span class="font-semibold text-gray-900 dark:text-white">
						{formatCurrency(transaction.amount)}
					</span>
				</div>
			{/each}
		</div>
	{/if}
</div>
