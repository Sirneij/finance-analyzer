<script lang="ts">
	import type { FinancialSummary } from '$lib/types/transaction.types';
	import { monthlySummariesChartConfig } from '$lib/utils/helpers/charts.helpers';
	import Chart from 'chart.js/auto';
	import Minimize from '$lib/components/icons/Minimize.svelte';
	import Expand from '$lib/components/icons/Expand.svelte';
	import Empty from '$lib/components/resuables/Empty.svelte';
	import LoadingChart from '$lib/components/resuables/LoadingChart.svelte';
	import { transformMonthlyChartData } from '$lib/utils/helpers/transactions.helpers';
	import { COLORS } from '$lib/utils/contants';
	import type { ProgressSteps } from '$lib/types/notification.types';

	let {
		financialSummaries,
		loading,
		steps
	}: { financialSummaries: FinancialSummary; loading: boolean; steps: ProgressSteps[] } = $props();

	let monthlySummariesCanvas = $state<HTMLCanvasElement>(),
		chartInitialized = false,
		monthlySummariesChart: Chart | null = null,
		isFullscreen = $state(false);

	function toggleFullscreen() {
		isFullscreen = !isFullscreen;
	}
	$effect(() => {
		if (!monthlySummariesCanvas || chartInitialized) return;

		const nonthlySummariesCtx = monthlySummariesCanvas.getContext('2d');
		if (!nonthlySummariesCtx) return;

		// Cleanup previous instance
		if (monthlySummariesChart) {
			monthlySummariesChart.destroy();
		}

		const monthlySummariesChartData = transformMonthlyChartData(
			financialSummaries?.monthly_summary || {}
		);
		monthlySummariesChartConfig.data = {
			labels: monthlySummariesChartData.labels,
			datasets: [
				{
					label: 'Income',
					data: monthlySummariesChartData.incomeData,
					borderColor: COLORS.income.chart,
					backgroundColor: 'rgba(34, 197, 94, 0.2)',
					tension: 0.4,
					fill: true, // Show the area under the line
					borderWidth: 2
				},
				{
					label: 'Expenses',
					data: monthlySummariesChartData.expensesData,
					borderColor: COLORS.expense.chart, // Red for expenses
					backgroundColor: 'rgba(239, 68, 68, 0.2)',
					tension: 0.4,
					fill: true,
					borderWidth: 2
				},
				{
					label: 'Savings',
					data: monthlySummariesChartData.savingsData,
					borderColor: COLORS.savings.chart, // Blue for savings
					backgroundColor: 'rgba(59, 130, 246, 0.2)',
					tension: 0.4,
					fill: true,
					borderWidth: 2
				}
			]
		};

		monthlySummariesChart = new Chart(nonthlySummariesCtx, monthlySummariesChartConfig);
		chartInitialized = true;

		// Cleanup on component destruction
		return () => {
			if (monthlySummariesChart) {
				monthlySummariesChart.destroy();
				chartInitialized = false;
			}
		};
	});
</script>

<div
	class="group relative rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
	class:fixed={isFullscreen}
	class:inset-0={isFullscreen}
	class:z-50={isFullscreen}
>
	<!-- Fullscreen button -->
	<button
		class="absolute right-2 top-2 rounded-lg bg-gray-100 p-2 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-700"
		onclick={toggleFullscreen}
	>
		{#if isFullscreen}
			<!-- Minimize icon -->
			<Minimize class="h-5 w-5" />
		{:else}
			<!-- Expand icon -->
			<Expand class="h-5 w-5" />
		{/if}
	</button>

	<div class="mb-4 flex items-center justify-between">
		<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Summary</h3>
		<div class="flex items-center gap-4">
			<span class="flex items-center text-sm text-gray-500 dark:text-gray-400">
				<span class="mr-1 h-3 w-3 rounded-full {COLORS.income.background}"></span> Income
			</span>
			<span class="flex items-center text-sm text-gray-500 dark:text-gray-400">
				<span class="mr-1 h-3 w-3 rounded-full {COLORS.expense.background}"></span> Expenses
			</span>
			<span class="flex items-center text-sm text-gray-500 dark:text-gray-400">
				<span class="mr-1 h-3 w-3 rounded-full {COLORS.savings.background}"></span> Savings
			</span>
		</div>
	</div>

	<div class={isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-64'}>
		{#if loading}
			<LoadingChart {steps} />
		{:else if !financialSummaries?.monthly_summary}
			<Empty
				title="No financial data available"
				description="Financial data will be available once you have made a few transactions."
			/>
		{:else}
			<canvas bind:this={monthlySummariesCanvas}></canvas>
		{/if}
	</div>
</div>

{#if isFullscreen}
	<button
		type="button"
		class="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm"
		onclick={toggleFullscreen}
		onkeydown={(e) => e.key === 'Escape' && toggleFullscreen()}
		aria-label="Close fullscreen view"
	></button>
{/if}

<style>
	.fixed {
		animation: zoom-in 0.2s ease-out;
		position: fixed;
		max-width: calc(100vw - 2rem);
		max-height: calc(100vh - 2rem);
		width: 100%;
		margin: auto;
	}

	@keyframes zoom-in {
		from {
			transform: scale(0.95);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}
</style>
