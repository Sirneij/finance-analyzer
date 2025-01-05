<script lang="ts">
	import type { FinancialStats } from '$lib/types/transaction.types';
	import Amount from '$lib/components/icons/Amount.svelte';
	import Caret from '$lib/components/icons/Caret.svelte';
	import CircledSum from '$lib/components/icons/CircledSum.svelte';
	import ExpenseList from '$lib/components/icons/ExpenseList.svelte';
	import { createCountAnimation } from '$lib/states/counter.svelte';

	let {
		transactionSummaries
	}: {
		transactionSummaries: {
			income: FinancialStats;
			expenses: FinancialStats;
			savings: FinancialStats;
		};
	} = $props();

	const incomeCounter = createCountAnimation(0, transactionSummaries.income.total);
	const expensesCounter = createCountAnimation(0, transactionSummaries.expenses.total);
	const savingsCounter = createCountAnimation(0, transactionSummaries.savings.total);

	$effect.root(() => {
		// Start animations immediately
		incomeCounter.startAnimation();
		expensesCounter.startAnimation();
		savingsCounter.startAnimation();

		return () => {
			incomeCounter.cleanup();
			expensesCounter.cleanup();
			savingsCounter.cleanup();
		};
	});
</script>

<div class="grid gap-6 sm:grid-cols-3">
	<div
		class="rounded-lg bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-gray-800"
	>
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<CircledSum class="h-5 w-5 text-green-500" />
				<h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Income</h3>
			</div>
			<div class="flex items-center gap-1">
				<Caret
					trend={transactionSummaries.income.trend}
					class={`h-4 w-4 ${transactionSummaries.income.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}
				/>
				<span
					class={`text-sm ${transactionSummaries.income.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}
				>
					{transactionSummaries.income.change}%
				</span>
			</div>
		</div>
		<p class="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
			<span class="text-lg">$</span>{incomeCounter.value.toLocaleString()}
		</p>
	</div>

	<div
		class="rounded-lg bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-gray-800"
	>
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<ExpenseList class="h-5 w-5 text-red-500" />
				<h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</h3>
			</div>
			<div class="flex items-center gap-1">
				<Caret
					trend={transactionSummaries.expenses.trend}
					class={`h-4 w-4 ${transactionSummaries.expenses.trend === 'up' ? 'text-red-500' : 'text-green-500'}`}
				/>
				<span
					class={`text-sm ${transactionSummaries.expenses.trend === 'up' ? 'text-red-500' : 'text-green-500'}`}
				>
					{transactionSummaries.expenses.change}%
				</span>
			</div>
		</div>
		<p class="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
			<span class="text-lg">$</span>{expensesCounter.value.toLocaleString()}
		</p>
	</div>

	<div
		class="rounded-lg bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-gray-800"
	>
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<Amount class="h-5 w-5 text-blue-500" />
				<h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Savings</h3>
			</div>
			<div class="flex items-center gap-1">
				<Caret
					trend={transactionSummaries.savings.trend}
					class={`h-4 w-4 ${transactionSummaries.savings.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}
				/>
				<span
					class={`text-sm ${transactionSummaries.savings.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}
				>
					{transactionSummaries.savings.change}%
				</span>
			</div>
		</div>
		<p class="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
			<span class="text-lg">$</span>{savingsCounter.value.toLocaleString()}
		</p>
	</div>
</div>
