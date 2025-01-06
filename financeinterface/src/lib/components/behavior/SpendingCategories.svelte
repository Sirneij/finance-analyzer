<script lang="ts">
	import Chart from 'chart.js/auto';
	import LoadingChart from '$lib/components/resuables/LoadingChart.svelte';
	import type { CategoriesData } from '$lib/types/transaction.types';
	import {
		generateChartColors,
		spendingCategoriesChartConfig
	} from '$lib/utils/helpers/charts.helpers';
	import Empty from '$lib/components/resuables/Empty.svelte';
	import Minimize from '$lib/components/icons/Minimize.svelte';
	import Expand from '$lib/components/icons/Expand.svelte';

	let { categories, loading }: { categories: CategoriesData; loading: boolean } = $props();

	let spendingCategoriesCanvas = $state<HTMLCanvasElement>(),
		chartInitialized = false,
		spendingCategoriesChart: Chart | null = null,
		isFullscreen = $state(false);

	function toggleFullscreen() {
		isFullscreen = !isFullscreen;
	}

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

<div
	class="group relative rounded-lg bg-white p-6 shadow-sm transition-all duration-300 dark:bg-gray-800"
	class:fixed={isFullscreen}
	class:inset-0={isFullscreen}
	class:z-50={isFullscreen}
	class:!m-4={isFullscreen}
>
	<!-- Fullscreen button -->
	<button
		class="absolute right-2 top-2 rounded-lg bg-gray-100 p-2 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-700"
		onclick={toggleFullscreen}
		onkeydown={(e) => e.key === 'Escape' && toggleFullscreen()}
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
			<LoadingChart />
		{:else if !categories || !Object.keys(categories.categories).length}
			<Empty title="No data found" description="No spending categories found in your account." />
		{:else}
			<canvas bind:this={spendingCategoriesCanvas}></canvas>
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
