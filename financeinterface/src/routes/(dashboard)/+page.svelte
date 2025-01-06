<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import BehaviouralInsights from '$lib/components/transactions/BehaviouralInsights.svelte';
	import FinanceChart from '$lib/components/transactions/FinanceChart.svelte';
	import Summary from '$lib/components/transactions/Summary.svelte';
	import Transactions from '$lib/components/transactions/Transactions.svelte';
	import type { SpendingReport, Transaction, FinancialSummary } from '$lib/types/transaction.types';
	import { getFirstName } from '$lib/utils/helpers/name.helpers';
	import { getTransactionAnalysis } from '$lib/utils/helpers/transactions.helpers';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import MonthlySummary from '$lib/components/transactions/MonthlySummary.svelte';
	import Add from '$lib/components/icons/Add.svelte';
	import Bar from '$lib/components/icons/Bar.svelte';

	let { data }: { data: PageData } = $props();

	const transactions: Transaction[] = data.transactions || [];
	const financialSummaries: FinancialSummary = data.summary || {};

	let transAnalysis: SpendingReport = $state({} as SpendingReport),
		loading = $state(true);

	$effect(() => {
		if (!browser) return;
		const fetchAnalysis = async () => {
			try {
				loading = true;
				transAnalysis = await getTransactionAnalysis();
			} catch (e) {
				console.error(e);
			} finally {
				loading = false;
			}
		};

		onMount(async () => await fetchAnalysis());
	});
</script>

<div class="space-y-6">
	<!-- Welcome Section -->
	<div class="flex flex-col space-y-4 rounded-lg bg-white p-4 shadow-sm sm:p-6 dark:bg-gray-800">
		<div class="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
			<img
				src={page.data.user?.avatar}
				alt={page.data.user?.name}
				class="h-12 w-12 rounded-full ring-2 ring-blue-500 sm:h-14 sm:w-14 md:h-16 md:w-16"
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
				class="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-50 px-4 py-2 text-blue-600 hover:bg-blue-100 sm:w-auto dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
				href="/transactions/add"
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
	</div>
	<!-- Financial Summary Cards -->
	<Summary {financialSummaries} />

	<!-- Card and Insights Grid -->
	<div class="grid gap-4 sm:gap-6 md:grid-cols-1 lg:grid-cols-2">
		<!-- Behavioral Insights -->
		<BehaviouralInsights categories={transAnalysis.categories} {loading} />
		<!-- Monthly summary -->
		<MonthlySummary {financialSummaries} {loading} />
	</div>

	<!-- Charts + Transactions Grid -->
	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Financial Charts -->
		<FinanceChart {loading} spending_analysis={transAnalysis.spending_analysis} />

		<!-- Recent Transactions -->
		<div class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
				<a
					class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
					href="/transactions"
				>
					View All
				</a>
			</div>
			<Transactions {transactions} />
		</div>
	</div>
</div>
