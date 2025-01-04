<script lang="ts">
	import { truncateText } from '$lib/utils/helpers/text.helpers';
	import type { Transaction } from '$lib/utils/types/transaction.types';

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
								: 'bg-blue-100 dark:bg-blue-900/20'
					}`}
				>
					<svg
						class={`h-5 w-5 ${
							tx.type === 'income'
								? 'text-green-600 dark:text-green-400'
								: tx.type === 'expense'
									? 'text-red-600 dark:text-red-400'
									: 'text-blue-600 dark:text-blue-400'
						}`}
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d={tx.type === 'income'
								? 'M5 10l7-7m0 0l7 7m-7-7v18'
								: tx.type === 'expense'
									? 'M19 14l-7 7m0 0l-7-7m7 7V3'
									: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'}
						/>
					</svg>
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
	{/each}
</div>
