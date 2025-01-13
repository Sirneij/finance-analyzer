<script lang="ts">
	import { truncateText } from '$lib/utils/helpers/text.helpers';
	import type { Transaction } from '$lib/types/transaction.types';
	import MoneyArrow from '$lib/components/icons/MoneyArrow.svelte';
	import Empty from '$lib/components/resuables/Empty.svelte';

	let { transactions }: { transactions: Transaction[] } = $props();
</script>

<div class="space-y-4">
	{#each transactions as tx}
		<div
			class="flex items-center justify-between rounded-lg border border-gray-100 p-4 dark:border-gray-700"
		>
			<div class="flex items-center space-x-3">
				<div
					class={`rounded-full p-2 ${
						tx.type === 'income'
							? 'bg-green-100 dark:bg-green-900/20'
							: tx.type === 'expense'
								? 'bg-red-100 dark:bg-red-900/20'
								: 'bg-indigo-100 dark:bg-indigo-900/20'
					}`}
				>
					<MoneyArrow txType={tx.type} />
				</div>
				<div>
					<p class="font-medium text-gray-900 dark:text-white">
						{truncateText(tx.description)}
					</p>
					<p class="text-sm text-gray-500 dark:text-gray-400">
						{new Date(tx.date).toLocaleDateString()}
					</p>
				</div>
			</div>
			<span
				class={`font-medium ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
			>
				{tx.amount > 0 ? '+' : ''}<span class="text-sm">$</span>{Math.abs(
					tx.amount
				).toLocaleString()}
			</span>
		</div>
	{:else}
		<div class="flex items-center justify-center p-4">
			<Empty
				title="No transactions available"
				description="You have not made any transactions yet."
			/>
		</div>
	{/each}
</div>
