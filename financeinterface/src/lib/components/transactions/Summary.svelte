<script lang="ts">
	import type { FinancialStats } from '$lib/types/transaction.types';
	import Amount from '../icons/Amount.svelte';

	let {
		transactionSummaries
	}: {
		transactionSummaries: {
			income: FinancialStats;
			expenses: FinancialStats;
			savings: FinancialStats;
		};
	} = $props();
</script>

<div class="grid gap-6 sm:grid-cols-3">
	<div
		class="rounded-lg bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-gray-800"
	>
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<svg
					class="h-5 w-5 text-green-500"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					<path d="M12 7v10m4-5H8" />
				</svg>
				<h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Income</h3>
			</div>
			<div class="flex items-center gap-1">
				<svg
					class={`h-4 w-4 ${transactionSummaries.income.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
				>
					<path d={transactionSummaries.income.trend === 'up' ? 'M5 15l7-7 7 7' : 'M5 9l7 7 7-7'} />
				</svg>
				<span
					class={`text-sm ${transactionSummaries.income.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}
				>
					{transactionSummaries.income.change}%
				</span>
			</div>
		</div>
		<p class="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
			<span class="text-lg">$</span>{transactionSummaries.income.total.toLocaleString()}
		</p>
	</div>

	<div
		class="rounded-lg bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-gray-800"
	>
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<svg
					class="h-5 w-5 text-red-500"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M3 6h18M7 12h10M11 18h2" />
				</svg>
				<h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</h3>
			</div>
			<div class="flex items-center gap-1">
				<svg
					class={`h-4 w-4 ${transactionSummaries.income.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
				>
					<path
						d={transactionSummaries.expenses.trend === 'up' ? 'M5 15l7-7 7 7' : 'M5 9l7 7 7-7'}
					/>
				</svg>
				<span
					class={`text-sm ${transactionSummaries.expenses.trend === 'up' ? 'text-red-500' : 'text-green-500'}`}
				>
					{transactionSummaries.expenses.change}%
				</span>
			</div>
		</div>
		<p class="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
			<span class="text-lg">$</span>{transactionSummaries.expenses.total.toLocaleString()}
		</p>
	</div>

	<div
		class="rounded-lg bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-gray-800"
	>
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<Amount class="h-4 w-4 text-blue-500" />
				<h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Savings</h3>
			</div>
			<div class="flex items-center gap-1">
				<svg
					class={`h-4 w-4 ${transactionSummaries.income.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
				>
					<path
						d={transactionSummaries.savings.trend === 'up' ? 'M5 15l7-7 7 7' : 'M5 9l7 7 7-7'}
					/>
				</svg>
				<span
					class={`text-sm ${transactionSummaries.savings.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}
				>
					{transactionSummaries.savings.change}%
				</span>
			</div>
		</div>
		<p class="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
			<span class="text-lg">$</span>{transactionSummaries.savings.total.toLocaleString()}
		</p>
	</div>
</div>
