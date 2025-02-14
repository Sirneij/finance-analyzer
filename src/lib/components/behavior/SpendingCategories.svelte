<script lang="ts">
	import LoadingChart from '$lib/components/reusables/LoadingChart.svelte';
	import type { CategoriesData } from '$lib/types/transaction.types';
	import {
		generateChartColors,
		spendingCategoriesChartConfig,
		updateChartTheme
	} from '$lib/utils/helpers/charts.helpers';
	import Empty from '$lib/components/reusables/Empty.svelte';
	import Minimize from '$lib/components/icons/Minimize.svelte';
	import Expand from '$lib/components/icons/Expand.svelte';
	import type { ProgressSteps } from '$lib/types/notification.types';
	import { browser } from '$app/environment';

	let {
		categories,
		loading,
		steps
	}: { categories: CategoriesData; loading: boolean; steps: ProgressSteps[] } = $props();

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
			const categoryCount = Object.keys(categories.expenses).length;
			const { backgroundColors } = generateChartColors(categoryCount);

			const options = {
				...spendingCategoriesChartConfig,
				series: Object.values(categories.expenses),
				labels: Object.keys(categories.expenses).map(
					(cat) => cat.charAt(0).toUpperCase() + cat.slice(1)
				),
				colors: backgroundColors,
				chart: {
					...spendingCategoriesChartConfig.chart,
					type: 'pie'
				},
				plotOptions: {
					pie: {
						donut: {
							size: '65%'
						}
					}
				},
				responsive: [
					{
						breakpoint: 480,
						options: {
							chart: {
								width: '100%'
							},
							legend: {
								position: 'bottom'
							}
						}
					}
				]
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
		if (browser && chartElement) {
			initChart();
		}
	});
</script>

<div
	class="group relative rounded-lg bg-white p-6 shadow-xs transition-all duration-300 dark:bg-gray-800"
	class:fixed={isFullscreen}
	class:inset-0={isFullscreen}
	class:z-50={isFullscreen}
	class:!m-4={isFullscreen}
>
	<!-- Fullscreen button -->
	<button
		class="absolute top-2 right-2 rounded-lg bg-gray-100 p-2 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-700"
		onclick={toggleFullscreen}
		aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
	>
		{#if isFullscreen}
			<Minimize class="h-5 w-5" />
		{:else}
			<Expand class="h-5 w-5" />
		{/if}
	</button>
	<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Spending Categories</h2>
	<div class={`transition-all duration-300 ${isFullscreen ? 'h-[calc(100vh-8rem)]' : 'h-64'}`}>
		{#if loading}
			<LoadingChart {steps} />
		{:else if !categories || !Object.keys(categories.expenses).length}
			<Empty title="No data found" description="No spending categories found in your account." />
		{:else}
			<div bind:this={chartElement}></div>
		{/if}
	</div>
</div>

{#if isFullscreen}
	<button
		type="button"
		class="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-xs"
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
