<script lang="ts">
	import Chart from 'chart.js/auto';
	import LoadingChart from '$lib/components/resuables/LoadingChart.svelte';
	import type { CategoriesData } from '$lib/types/transaction.types';
	import {
		generateChartColors,
		spendingCategoriesChartConfig
	} from '$lib/utils/helpers/charts.helpers';
	import Empty from '$lib/components/resuables/Empty.svelte';

	let { categories, loading }: { categories: CategoriesData; loading: boolean } = $props();

	let spendingCategoriesCanvas = $state<HTMLCanvasElement>(),
		chartInitialized = false,
		spendingCategoriesChart: Chart | null = null;

	$effect(() => {
		if (!spendingCategoriesCanvas || chartInitialized) return;

		const spendingCategoriesCtx = spendingCategoriesCanvas.getContext('2d');
		if (!spendingCategoriesCtx) return;

		// Cleanup previous instance
		if (spendingCategoriesChart) {
			spendingCategoriesChart.destroy();
		}

		const categoryCount = Object.keys(categories.categories).length;
		const { backgroundColors, borderColors } = generateChartColors(categoryCount);

		spendingCategoriesChartConfig.data = {
			labels: Object.keys(categories.categories).map(
				(cat) => cat.charAt(0).toUpperCase() + cat.slice(1)
			),
			datasets: [
				{
					data: Object.values(categories.categories),
					backgroundColor: backgroundColors,
					borderColor: borderColors,
					borderWidth: 1
				}
			]
		};

		spendingCategoriesChart = new Chart(spendingCategoriesCtx, spendingCategoriesChartConfig);
		chartInitialized = true;

		// Cleanup on component destruction
		return () => {
			if (spendingCategoriesChart) {
				spendingCategoriesChart.destroy();
				chartInitialized = false;
			}
		};
	});
</script>

<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
	<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Spending Categories</h2>
	<div class="h-64">
		{#if loading}
			<LoadingChart />
		{:else if !categories || !Object.keys(categories.categories).length}
			<Empty title="No data found" description="No spending categories found in your account." />
		{:else}
			<canvas bind:this={spendingCategoriesCanvas}></canvas>
		{/if}
	</div>
</div>
