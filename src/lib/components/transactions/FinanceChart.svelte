<script lang="ts">
	import { financialChartConfig, updateChartTheme } from '$lib/utils/helpers/charts.helpers';
	import { transformChartData } from '$lib/utils/helpers/transactions.helpers';
	import type { SpendingAnalysis } from '$lib/types/transaction.types';
	import LoadingChart from '$lib/components/reusables/LoadingChart.svelte';
	import Empty from '$lib/components/reusables/Empty.svelte';
	import Expand from '$lib/components/icons/Expand.svelte';
	import Minimize from '$lib/components/icons/Minimize.svelte';
	import { COLORS } from '$lib/utils/contants';
	import type { ProgressSteps } from '$lib/types/notification.types';
	import { browser } from '$app/environment';

	let {
		spending_analysis,
		loading,
		steps
	}: { spending_analysis: SpendingAnalysis; loading: boolean; steps: ProgressSteps[] } = $props();

	let chartElement = $state<HTMLDivElement>(),
		chart: ApexCharts | null = null,
		isFullscreen = $state(false);

	function toggleFullscreen() {
		isFullscreen = !isFullscreen;
	}

	async function initChart() {
		if (!browser || !chartElement) return;

		try {
			// Dynamically import ApexCharts
			const { default: ApexCharts } = await import('apexcharts');
			const financialChartData = transformChartData(
				spending_analysis.daily_summary,
				spending_analysis.cumulative_balance
			);

			const options = {
				...financialChartConfig,
				series: [
					{
						name: 'Income',
						data: financialChartData.income
					},
					{
						name: 'Expenses',
						data: financialChartData.expenses
					},
					{
						name: 'Balance',
						data: financialChartData.balances
					}
				],
				xaxis: {
					categories: financialChartData.labels,
					labels: {
						style: {
							colors: 'rgba(156, 163, 175, 0.9)'
						}
					}
				},
				stroke: {
					width: [2, 2, 2],
					curve: 'smooth',
					dashArray: [0, 0, 5]
				}
			};
			// Cleanup previous instance
			if (chart) {
				chart.destroy();
			}

			chart = new ApexCharts(chartElement, options);
			chart.render();

			// Handle dark mode changes
			const observer = new MutationObserver(() => {
				const isDark = document.documentElement.classList.contains('dark');
				chart?.updateOptions(updateChartTheme(isDark));
			});

			observer.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ['class']
			});

			// Cleanup on component destruction
			return () => {
				observer.disconnect();
				if (chart) {
					chart.destroy();
				}
			};
		} catch (error) {
			console.error('Error initializing chart:', error);
		}
	}

	$effect(() => {
		if (browser && chartElement && spending_analysis) {
			initChart();
		}
	});
</script>

<div
	class="shadow-xs group relative rounded-xl bg-white p-6 dark:bg-gray-800"
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
		<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Financials</h3>
		<div class="flex items-center gap-4">
			<span class="flex items-center text-sm text-gray-500 dark:text-gray-400">
				<span class="mr-1 h-3 w-3 rounded-full {COLORS.income.background}"></span> Income
			</span>
			<span class="flex items-center text-sm text-gray-500 dark:text-gray-400">
				<span class="mr-1 h-3 w-3 rounded-full {COLORS.expense.background}"></span> Expenses
			</span>
			<span class="flex items-center text-sm text-gray-500 dark:text-gray-400">
				<span class="mr-1 h-3 w-3 rounded-full {COLORS.balance.background}"></span> Balance
			</span>
		</div>
	</div>

	<div class={isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-64'}>
		{#if loading}
			<LoadingChart {steps} />
		{:else if !spending_analysis}
			<Empty
				title="No financial data available"
				description="Financial data will be available once you have made a few transactions."
			/>
		{:else}
			<div bind:this={chartElement}></div>
		{/if}
	</div>
</div>

{#if isFullscreen}
	<button
		type="button"
		class="backdrop-blur-xs fixed inset-0 z-40 bg-gray-900/50"
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
