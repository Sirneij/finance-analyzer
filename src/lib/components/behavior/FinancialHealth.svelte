<script lang="ts">
	import type { FinancialHealth } from '$lib/types/transaction.types';
	import type { ProgressSteps } from '$lib/types/notification.types';
	import LoadingInsight from '../reusables/LoadingInsight.svelte';
	import Empty from '$lib/components/reusables/Empty.svelte';
	import { fly } from 'svelte/transition';
	import Wallet from '$lib/components/icons/Wallet.svelte';

	let {
		health,
		loading,
		steps
	}: { health: FinancialHealth; loading: boolean; steps: ProgressSteps[] } = $props();

	function getScoreColor(score: number): string {
		if (score >= 80) return 'text-green-500 bg-green-50 dark:bg-green-500/10';
		if (score >= 60) return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10';
		return 'text-red-500 bg-red-50 dark:bg-red-500/10';
	}

	function getMetricColor(value: number, type: 'dti' | 'savings' | 'growth'): string {
		switch (type) {
			case 'dti':
				return value <= 0.36
					? 'text-green-500'
					: value <= 0.43
						? 'text-yellow-500'
						: 'text-red-500';
			case 'savings':
				return value >= 20 ? 'text-green-500' : value >= 10 ? 'text-yellow-500' : 'text-red-500';
			case 'growth':
				return value > 0 ? 'text-green-500' : value === 0 ? 'text-yellow-500' : 'text-red-500';
			default:
				return 'text-gray-500';
		}
	}
</script>

<div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
	<div class="mb-4 flex items-center justify-between">
		<div class="flex items-center gap-2">
			<Wallet class="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Financial Health</h3>
		</div>
	</div>

	{#if loading}
		<LoadingInsight {steps} numBoxes={1} />
	{:else if !health}
		<Empty
			title="No health data"
			description="We need more data to calculate your financial health."
		/>
	{:else}
		<div class="max-h-64 space-y-4" in:fly={{ y: 20, duration: 300 }}>
			<!-- Score Card -->
			<div class="flex items-center justify-between rounded-lg border p-3 dark:border-gray-700">
				<div class="flex items-center gap-3">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-full {getScoreColor(
							health.financial_health_score
						)}"
					>
						<span class="text-lg font-bold">{health.financial_health_score}</span>
					</div>
					<div>
						<p class="font-medium text-gray-900 dark:text-white">Overall Score</p>
						<p class="text-sm text-gray-500">Based on 3 metrics</p>
					</div>
				</div>
			</div>

			<!-- Metrics -->
			<div class="grid grid-cols-3 gap-3">
				<div class="rounded-lg border p-3 dark:border-gray-700">
					<p class="text-sm text-gray-500">DTI Ratio</p>
					<p
						class="mt-1 text-lg font-semibold {getMetricColor(health.debt_to_income_ratio, 'dti')}"
					>
						{(health.debt_to_income_ratio * 100).toFixed(2)}%
					</p>
				</div>
				<div class="rounded-lg border p-3 dark:border-gray-700">
					<p class="text-sm text-gray-500">Savings</p>
					<p class="mt-1 text-lg font-semibold {getMetricColor(health.savings_rate, 'savings')}">
						{health.savings_rate.toFixed(2)}%
					</p>
				</div>
				<div class="rounded-lg border p-3 dark:border-gray-700">
					<p class="text-sm text-gray-500">Growth</p>
					<p
						class="mt-1 text-lg font-semibold {getMetricColor(
							health.balance_growth_rate,
							'growth'
						)}"
					>
						{health.balance_growth_rate.toFixed(2)}%
					</p>
				</div>
			</div>
		</div>
	{/if}
</div>
