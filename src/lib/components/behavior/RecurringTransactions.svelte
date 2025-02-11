<script lang="ts">
	import type { RecurringTransaction } from '$lib/types/transaction.types';
	import type { ProgressSteps } from '$lib/types/notification.types';
	import LoadingInsight from '$lib/components/reusables/LoadingInsight.svelte';
	import Empty from '$lib/components/reusables/Empty.svelte';
	import { formatCurrency } from '$lib/utils/helpers/money.helpers.svelte';
	import { fly } from 'svelte/transition';
	import CalendarDollar from '../icons/CalendarDollar.svelte';
	import { RecurringTxnIcons } from '../icons';

	let {
		transactions,
		loading,
		steps
	}: { transactions: RecurringTransaction[]; loading: boolean; steps: ProgressSteps[] } = $props();

	function getConfidenceColor(confidence: string): string {
		switch (confidence.toLowerCase()) {
			case 'high':
				return 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400';
			case 'medium':
				return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-400';
			default:
				return 'bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-700 dark:text-gray-300';
		}
	}
</script>

<div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
	<div class="mb-6 flex items-center justify-between">
		<div class="flex items-center gap-2">
			<CalendarDollar class="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Recurring Transactions</h3>
		</div>
		{#if !loading && transactions?.length}
			<span
				class="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
			>
				{transactions.length} recurring
			</span>
		{/if}
	</div>

	{#if loading}
		<LoadingInsight {steps} numBoxes={3} />
	{:else if !transactions?.length}
		<Empty
			title="No recurring transactions"
			description="We haven't detected any recurring transactions yet."
		/>
	{:else}
		<div class="max-h-32 space-y-3 overflow-y-auto pr-2">
			{#each transactions as transaction}
				{@const Icon =
					RecurringTxnIcons[transaction.frequency.toLowerCase() as keyof typeof RecurringTxnIcons]}
				<div
					class="group relative flex items-center gap-4 rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-indigo-900"
					in:fly={{ y: 20, duration: 300 }}
				>
					<div
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/10"
					>
						<Icon class="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
					</div>

					<div class="flex-1 space-y-1">
						<div class="flex items-center gap-2">
							<h4 class="font-medium text-gray-900 dark:text-white">
								{transaction.description}
							</h4>
							<span
								class="rounded-full px-2 py-0.5 text-xs font-medium {getConfidenceColor(
									transaction.confidence
								)}"
							>
								{transaction.confidence}
							</span>
						</div>
						<p class="text-sm text-gray-500 dark:text-gray-400">
							Occurs {transaction.frequency}
						</p>
					</div>

					<div class="text-right">
						<span class="block text-lg font-semibold text-gray-900 dark:text-white">
							{formatCurrency(transaction.amount)}
						</span>
						<span class="text-xs text-gray-500 dark:text-gray-400"
							>per {transaction.frequency.toLowerCase()}</span
						>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
