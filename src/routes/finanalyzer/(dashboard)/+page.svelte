<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import BehaviouralInsights from '$lib/components/transactions/BehaviouralInsights.svelte';
	import FinanceChart from '$lib/components/transactions/FinanceChart.svelte';
	import Summary from '$lib/components/transactions/Summary.svelte';
	import Transactions from '$lib/components/transactions/Transactions.svelte';
	import type { SpendingReport, Transaction, FinancialSummary } from '$lib/types/transaction.types';
	import { getFirstName } from '$lib/utils/helpers/name.helpers';
	import { onDestroy, onMount } from 'svelte';
	import type { PageData } from './$types';
	import MonthlySummary from '$lib/components/transactions/MonthlySummary.svelte';
	import Add from '$lib/components/icons/Add.svelte';
	import Bar from '$lib/components/icons/Bar.svelte';
	import { BASE_WS_URI } from '$lib/utils/contants';
	import { NEEDEDDATA, WebSocketService } from '$lib/services/websocket';
	import type { ProgressSteps } from '$lib/types/notification.types';
	import AnimatedContainer from '$lib/components/animations/AnimatedContainer.svelte';
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';

	let { data }: { data: PageData } = $props();

	let transAnalysis: SpendingReport = $state({} as SpendingReport),
		loadingAnalysis = $state(true),
		loadingSummary = $state(true),
		finance = $state({} as FinancialSummary),
		loadingSummaryProgress: ProgressSteps[] = $state([]),
		loadingAnalysisProgress: ProgressSteps[] = $state([]),
		webSocketService: WebSocketService;

	onMount(() => {
		if (browser) {
			webSocketService = new WebSocketService(`${BASE_WS_URI}`, data.user?._id || '', [
				NEEDEDDATA.SUMMARY,
				NEEDEDDATA.ANALYSIS
			]);

			webSocketService.socket.onmessage = (event: MessageEvent) => {
				const data = JSON.parse(event.data);
				switch (data.action) {
					case 'progress':
						if (data.taskType === 'Summarize') {
							loadingSummaryProgress.push({
								progress: data.progress,
								message: data.message
							});
						} else if (data.taskType === 'Analysis') {
							loadingAnalysisProgress.push({
								progress: data.progress,
								message: data.message
							});
						}
						break;
					case 'summary_complete':
						finance = data.result;
						loadingSummary = false;
						break;
					case 'analysis_complete':
						transAnalysis = data.result;
						loadingAnalysis = false;
						break;
					default:
						break;
				}
			};
		}
	});

	onDestroy(() => {
		if (webSocketService) webSocketService.close();
	});
</script>

<AnimatedContainer class="space-y-6">
	<!-- Welcome Section -->
	<AnimatedSection
		y={20}
		class="flex flex-col space-y-4 rounded-lg bg-white p-4 shadow-sm sm:p-6 dark:bg-gray-800"
	>
		<div class="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
			<img
				src={page.data.user?.avatar}
				alt={page.data.user?.name}
				class="h-12 w-12 rounded-full ring-2 ring-indigo-500 sm:h-14 sm:w-14 md:h-16 md:w-16"
				loading="lazy"
			/>
			<div class="text-center sm:text-left">
				<h1 class="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl dark:text-white">
					Welcome back, {getFirstName(page.data.user?.name)}!
				</h1>
				<p class="text-sm text-gray-600 sm:text-base dark:text-gray-400">
					Here's your financial overview
				</p>
			</div>
		</div>

		<div class="flex flex-col gap-2 sm:flex-row sm:gap-3">
			<a
				class="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-50 px-4 py-2 text-indigo-600 hover:bg-indigo-100 sm:w-auto dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
				href="/behavior#manual-add"
			>
				<Add class="h-5 w-5" />
				<span>Add Transaction</span>
			</a>

			<button
				class="flex w-full items-center justify-center space-x-2 rounded-lg bg-gray-50 px-4 py-2 text-gray-600 hover:bg-gray-100 sm:w-auto dark:bg-gray-700/50 dark:text-gray-400 dark:hover:bg-gray-700"
			>
				<Bar class="h-5 w-5" />
				<span>Reports</span>
			</button>
		</div>
	</AnimatedSection>
	<!-- Financial Summary Cards -->
	<AnimatedSection y={30} delay={200}>
		<Summary bind:financialSummaries={finance} />
	</AnimatedSection>

	<!-- Card and Insights Grid -->
	<AnimatedSection y={40} delay={400} class="grid gap-4 sm:gap-6 md:grid-cols-1 lg:grid-cols-2">
		<!-- Behavioral Insights -->
		<BehaviouralInsights
			categories={transAnalysis.categories}
			loading={loadingAnalysis}
			steps={loadingAnalysisProgress}
		/>
		<!-- Monthly summary -->
		<MonthlySummary
			financialSummaries={finance}
			loading={loadingSummary}
			steps={loadingSummaryProgress}
		/>
	</AnimatedSection>

	<!-- Charts + Transactions Grid -->
	<AnimatedSection y={50} delay={600} class="grid gap-6 lg:grid-cols-2">
		<!-- Financial Charts -->
		<FinanceChart
			loading={loadingAnalysis}
			spending_analysis={transAnalysis.spending_analysis}
			steps={loadingAnalysisProgress}
		/>

		<!-- Recent Transactions -->
		<div class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
				<a
					class="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
					href="/finanalyzer/transactions"
				>
					View All
				</a>
			</div>
			<Transactions transactions={data.transactions} />
		</div>
	</AnimatedSection>
</AnimatedContainer>
