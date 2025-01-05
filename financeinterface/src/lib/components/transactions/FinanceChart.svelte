<script lang="ts">
	import Chart from 'chart.js/auto';
	import { financialChartConfig } from '$lib/utils/helpers/charts.helpers';
	import { transformChartData } from '$lib/utils/helpers/transactions.helpers';
	import type { SpendingAnalysis } from '$lib/types/transaction.types';

	let { spending_analysis, loading }: { spending_analysis: SpendingAnalysis; loading: boolean } =
		$props();

	let financialTrendsCanvas = $state<HTMLCanvasElement>(),
		chartInitialized = false,
		financialTrendChart: Chart | null = null;
	$effect(() => {
		if (!financialTrendsCanvas || chartInitialized) return;

		const financialTrendCtx = financialTrendsCanvas.getContext('2d');
		if (!financialTrendCtx) return;

		// Cleanup previous instance
		if (financialTrendChart) {
			financialTrendChart.destroy();
		}

		const financialChartData = transformChartData(
			spending_analysis.daily_summary,
			spending_analysis.cumulative_balance
		);
		financialChartConfig.data = {
			labels: financialChartData.labels,
			datasets: [
				{
					label: 'Income',
					data: financialChartData.income,
					borderColor: '#3B82F6',
					tension: 0.4,
					animation: {
						delay: 500,
						duration: 2000
					}
				},
				{
					label: 'Expenses',
					data: financialChartData.expenses,
					borderColor: '#EF4444',
					tension: 0.4,
					animation: {
						delay: 500,
						duration: 2000
					}
				},
				{
					label: 'Balance',
					data: financialChartData.balances,
					borderColor: '#10B981',
					borderDash: [5, 5],
					tension: 0.4,
					animation: {
						delay: 500,
						duration: 2000
					}
				}
			]
		};

		financialTrendChart = new Chart(financialTrendCtx, financialChartConfig);
		chartInitialized = true;

		// Cleanup on component destruction
		return () => {
			if (financialTrendChart) {
				financialTrendChart.destroy();
				chartInitialized = false;
			}
		};
	});
</script>

<div class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
	<div class="mb-4 flex items-center justify-between">
		<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Financials</h3>
		<div class="flex items-center gap-4">
			<span class="flex items-center text-sm text-gray-500 dark:text-gray-400">
				<span class="mr-1 h-3 w-3 rounded-full bg-blue-500"></span> Income
			</span>
			<span class="flex items-center text-sm text-gray-500 dark:text-gray-400">
				<span class="mr-1 h-3 w-3 rounded-full bg-red-500"></span> Expenses
			</span>
			<span class="flex items-center text-sm text-gray-500 dark:text-gray-400">
				<span class="mr-1 h-3 w-3 rounded-full bg-green-500"></span> Balance
			</span>
		</div>
	</div>
	<div class="h-64">
		{#if loading}
			<div class="flex h-full w-full items-end justify-between gap-2 px-4">
				{#each Array(12) as _, i}
					<div
						class="w-full animate-pulse bg-gray-200 dark:bg-gray-700"
						style="height: {Math.random() * 60 + 20}%; animation-delay: {i * 100}ms;"
					></div>
				{/each}
			</div>
		{:else}
			<canvas bind:this={financialTrendsCanvas}></canvas>
		{/if}
	</div>
</div>
