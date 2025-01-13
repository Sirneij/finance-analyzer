<script lang="ts">
	import type { FinancialSummary } from '$lib/types/transaction.types';
	import Amount from '$lib/components/icons/Amount.svelte';
	import Caret from '$lib/components/icons/Caret.svelte';
	import CircledSum from '$lib/components/icons/CircledSum.svelte';
	import ExpenseList from '$lib/components/icons/ExpenseList.svelte';
	import { formatMoney } from '$lib/utils/helpers/money.helpers';
	import { formatDate } from '$lib/utils/helpers/date.helpers';

	let { financialSummaries = $bindable() }: { financialSummaries: FinancialSummary } = $props();
</script>

{#if financialSummaries}
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
						trend={financialSummaries?.income?.trend ?? 'up'}
						class={`h-4 w-4 ${(financialSummaries?.income?.trend ?? 'up') === 'up' ? 'text-green-500' : 'text-red-500'}`}
					/>
					<span
						class={`text-sm ${(financialSummaries?.income?.trend ?? 'up') === 'up' ? 'text-green-500' : 'text-red-500'}`}
					>
						{(financialSummaries?.income?.change ?? 0).toFixed(2)}%
					</span>
				</div>
			</div>
			<p class="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
				{formatMoney(financialSummaries?.income?.total)}
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
						trend={financialSummaries?.expenses?.trend ?? 'up'}
						class={`h-4 w-4 ${(financialSummaries?.expenses?.trend ?? 'up') === 'up' ? 'text-red-500' : 'text-green-500'}`}
					/>
					<span
						class={`text-sm ${(financialSummaries?.expenses?.trend ?? 'up') === 'up' ? 'text-red-500' : 'text-green-500'}`}
					>
						{(financialSummaries?.expenses?.change ?? 0).toFixed(2)}%
					</span>
				</div>
			</div>
			<p class="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
				{formatMoney(financialSummaries?.expenses?.total)}
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
						trend={financialSummaries?.savings?.trend ?? 'up'}
						class={`h-4 w-4 ${(financialSummaries?.savings?.trend ?? 'up') === 'up' ? 'text-green-500' : 'text-red-500'}`}
					/>
					<span
						class={`text-sm ${(financialSummaries?.savings?.trend ?? 'up') === 'up' ? 'text-green-500' : 'text-red-500'}`}
					>
						{(financialSummaries?.savings?.change ?? 0).toFixed(2)}%
					</span>
				</div>
			</div>
			<p class="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
				{formatMoney(financialSummaries?.savings?.total)}
			</p>
		</div>
	</div>
{/if}

<div class="mt-6 grid gap-4 sm:grid-cols-4">
	<!-- Transaction Counts -->
	{#if financialSummaries.total_transactions}
		<div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
			<h4 class="text-xs font-medium text-gray-500 dark:text-gray-400">Total Transactions</h4>
			<p class="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
				{financialSummaries.total_transactions}
			</p>
			<div class="mt-1 flex gap-2">
				<span class="text-xs text-gray-500">↑ {financialSummaries.income_count} Income</span>
				<span class="text-xs text-gray-500">↓ {financialSummaries.expense_count} Expenses</span>
			</div>
		</div>
	{/if}

	<!-- Averages -->
	{#if financialSummaries.avg_income || financialSummaries.avg_expense}
		<div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
			<h4 class="text-xs font-medium text-gray-500 dark:text-gray-400">Average Transaction</h4>
			<div class="mt-2 flex flex-col gap-1">
				{#if financialSummaries.avg_income}
					<div class="flex justify-between">
						<span class="text-xs text-gray-500">Income</span>
						<span class="text-sm font-semibold text-gray-900 dark:text-white">
							{formatMoney(financialSummaries.avg_income)}
						</span>
					</div>
				{/if}

				{#if financialSummaries.avg_expense}
					<div class="flex justify-between">
						<span class="text-xs text-gray-500">Expense</span>
						<span class="text-sm font-semibold text-gray-900 dark:text-white">
							{formatMoney(financialSummaries.avg_expense)}
						</span>
					</div>
				{/if}
			</div>
		</div>
	{/if}
	<!-- Date Range -->
	{#if financialSummaries.start_date || financialSummaries.end_date}
		<div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
			<h4 class="text-xs font-medium text-gray-500 dark:text-gray-400">Period</h4>
			<div class="mt-2 flex flex-col gap-1">
				{#if financialSummaries.start_date}
					<div class="flex justify-between">
						<span class="text-xs text-gray-500">From</span>
						<span class="text-sm font-semibold text-gray-900 dark:text-white">
							{formatDate(financialSummaries.start_date)}
						</span>
					</div>
				{/if}

				{#if financialSummaries.end_date}
					<div class="flex justify-between">
						<span class="text-xs text-gray-500">To</span>
						<span class="text-sm font-semibold text-gray-900 dark:text-white">
							{formatDate(financialSummaries.end_date)}
						</span>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Savings Rate -->
	{#if financialSummaries.savings_rate}
		<div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
			<h4 class="text-xs font-medium text-gray-500 dark:text-gray-400">Savings Rate</h4>
			<p class="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
				{financialSummaries.savings_rate.toFixed(1)}%
			</p>
		</div>
	{/if}

	<!-- Largest Transactions -->
	{#if financialSummaries.largest_income}
		<div class="col-span-2 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
			<h4 class="text-xs font-medium text-gray-500 dark:text-gray-400">Largest Income</h4>
			<p class="mt-2 text-xl font-semibold text-green-500">
				{formatMoney(financialSummaries.largest_income)}
			</p>
		</div>
	{/if}

	{#if financialSummaries.largest_expense}
		<div class="col-span-2 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
			<h4 class="text-xs font-medium text-gray-500 dark:text-gray-400">Largest Expense</h4>
			<p class="mt-2 text-xl font-semibold text-red-500">
				{formatMoney(financialSummaries.largest_expense)}
			</p>
		</div>
	{/if}
</div>
