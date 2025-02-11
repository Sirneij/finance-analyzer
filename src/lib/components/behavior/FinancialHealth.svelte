<script lang="ts">
	import type { FinancialHealth } from '$lib/types/transaction.types';
	import type { ProgressSteps } from '$lib/types/notification.types';
	import LoadingInsight from '../reusables/LoadingInsight.svelte';
	import Empty from '$lib/components/reusables/Empty.svelte';

	let {
		health,
		loading,
		steps
	}: { health: FinancialHealth; loading: boolean; steps: ProgressSteps[] } = $props();

	function getScoreColor(score: number): string {
		if (score >= 80) return 'text-green-600';
		if (score >= 60) return 'text-yellow-600';
		return 'text-red-600';
	}
</script>

<div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
	<h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Financial Health Score</h3>

	{#if loading}
		<LoadingInsight {steps} numBoxes={1} />
	{:else if !health}
		<Empty
			title="No health data"
			description="We need more data to calculate your financial health."
		/>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="flex flex-col items-center rounded-lg border p-4 dark:border-gray-700">
				<span class="text-3xl font-bold {getScoreColor(health.financial_health_score)}">
					{health.financial_health_score}
				</span>
				<span class="text-sm text-gray-500 dark:text-gray-400">Overall Score</span>
			</div>
			<div class="space-y-3">
				<div class="flex justify-between">
					<span class="text-sm text-gray-600 dark:text-gray-400">Debt to Income</span>
					<span class="font-medium">{(health.debt_to_income_ratio * 100).toFixed(1)}%</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-gray-600 dark:text-gray-400">Savings Rate</span>
					<span class="font-medium">{(health.savings_rate * 100).toFixed(1)}%</span>
				</div>
				<div class="flex justify-between">
					<span class="text-sm text-gray-600 dark:text-gray-400">Balance Growth</span>
					<span class="font-medium">{(health.balance_growth_rate * 100).toFixed(1)}%</span>
				</div>
			</div>
		</div>
	{/if}
</div>
