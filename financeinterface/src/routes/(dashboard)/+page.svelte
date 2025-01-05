<script lang="ts">
	import { page } from '$app/state';
	import FinanceChart from '$lib/components/transactions/FinanceChart.svelte';
	import Summary from '$lib/components/transactions/Summary.svelte';
	import Transactions from '$lib/components/transactions/Transactions.svelte';
	import type { FinancialStats, SpendingReport, Transaction } from '$lib/types/transaction.types';
	import { getFirstName } from '$lib/utils/helpers/name.helpers';
	import {
		getTransactionAnalysis,
		transformCategoriesToArray
	} from '$lib/utils/helpers/transactions.helpers';
	import type { PageData } from './$types';

	const cardData = {
		balance: 7250.0,
		cardNumber: '**** **** **** 4242',
		validThru: '12/25',
		name: 'John Doe'
	};

	let { data }: { data: PageData } = $props();

	const transactions: Transaction[] = data.transactions;
	const transactionSummaries: {
		income: FinancialStats;
		expenses: FinancialStats;
		savings: FinancialStats;
	} = data.summary;

	let transAnalysis: SpendingReport = $state({} as SpendingReport),
		loading = $state(true);

	$effect(() => {
		const loadData = async () => {
			transAnalysis = await getTransactionAnalysis();
			loading = false;
		};
		loadData();
	});
</script>

<div class="space-y-6">
	<!-- Welcome Section -->
	<div
		class="flex flex-col space-y-4 rounded-lg bg-white p-4 sm:p-6 md:flex-row md:items-center md:justify-between md:space-y-0 dark:bg-gray-800"
	>
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

		<div class="flex flex-col space-y-2 sm:flex-row sm:space-x-3 sm:space-y-0">
			<button
				class="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-50 px-4 py-2 text-blue-600 hover:bg-blue-100 sm:w-auto dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
			>
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 6v6m0 0v6m0-6h6m-6 0H6"
					/>
				</svg>
				<span>Add Transaction</span>
			</button>

			<button
				class="flex w-full items-center justify-center space-x-2 rounded-lg bg-gray-50 px-4 py-2 text-gray-600 hover:bg-gray-100 sm:w-auto dark:bg-gray-700/50 dark:text-gray-400 dark:hover:bg-gray-700"
			>
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				<span>Reports</span>
			</button>
		</div>
	</div>
	<!-- Card and Insights Grid -->
	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Credit Card -->
		<div
			class="relative h-[220px] w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 p-6"
		>
			<div class="absolute left-0 top-0 h-full w-full">
				<!-- Card Chip -->
				<div class="absolute left-6 top-12 h-10 w-12 rounded-md bg-yellow-400/80"></div>
				<!-- Decorative circles -->
				<div class="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10"></div>
				<div class="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10"></div>
			</div>
			<div class="relative flex h-full flex-col justify-between text-white">
				<div>
					<h3 class="text-lg font-medium opacity-75">Current Balance</h3>
					<p class="text-3xl font-bold">
						<span class="text-lg">$</span>{cardData.balance.toLocaleString()}
					</p>
				</div>
				<div class="space-y-3">
					<p class="font-mono text-lg tracking-widest opacity-75">{cardData.cardNumber}</p>
					<div class="flex justify-between">
						<div>
							<p class="text-xs opacity-75">Valid Thru</p>
							<p class="font-mono">{cardData.validThru}</p>
						</div>
						<p class="self-end font-semibold">{page.data.user?.name}</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Behavioral Insights -->
		<div class="h-[220px] rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
			<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Behavioral Insights</h2>
			<div class="overflow-x-auto">
				<div class="flex gap-4 pb-2">
					{#if loading}
						{#each Array(4) as _, i}
							<div
								class="min-w-[200px] animate-pulse rounded-lg border border-gray-200 p-4 dark:border-gray-700"
							>
								<div class="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
								<div class="mt-2 h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
								<div class="mt-2 h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
							</div>
						{/each}
					{:else}
						{#each transformCategoriesToArray(transAnalysis.categories.percentages) as analysis}
							<div class="min-w-[200px] rounded-lg border border-gray-200 p-4 dark:border-gray-700">
								<h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">
									{analysis.title}
								</h3>
								<p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
									{analysis.value}
								</p>
								<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{analysis.description}</p>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Financial Summary Cards -->
	<Summary {transactionSummaries} />

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
