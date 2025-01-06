<script lang="ts">
	import Anomaly from '$lib/components/behavior/Anomaly.svelte';
	import Insight from '$lib/components/behavior/Insight.svelte';
	import SpendingCategories from '$lib/components/behavior/SpendingCategories.svelte';
	import Empty from '$lib/components/resuables/Empty.svelte';
	import FormError from '$lib/components/resuables/FormError.svelte';
	import LoadingInsight from '$lib/components/resuables/LoadingInsight.svelte';
	import FileInput from '$lib/components/transactions/FileInput.svelte';
	import type { SpendingReport } from '$lib/types/transaction.types';
	import {
		getFinancialInsights,
		getTransactionAnalysis
	} from '$lib/utils/helpers/transactions.helpers';
	import type { ActionData } from './$types';

	const { form }: { form: ActionData } = $props();

	const categories = [
		'Housing',
		'Transportation',
		'Food',
		'Utilities',
		'Entertainment',
		'Healthcare',
		'Shopping',
		'Other'
	];

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

<div class="space-y-6 p-6">
	<FormError {form} />
	<div class="grid gap-6 lg:grid-cols-2">
		<!-- File Upload -->
		<FileInput />

		<!-- Manual Input Form -->
		<div class="h-[384px] rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
			<h2
				class="sticky top-0 mb-4 bg-white text-lg font-semibold text-gray-900 dark:bg-gray-800 dark:text-white"
			>
				Manual Transaction Entry
			</h2>
			<div class="h-[calc(100%-2rem)] overflow-y-auto">
				<form class="space-y-4">
					<div class="space-y-1">
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="date">
							Date
						</label>
						<input
							type="date"
							id="date"
							class="block w-full rounded-md border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800"
						/>
					</div>

					<div class="space-y-1">
						<label
							class="block text-sm font-medium text-gray-700 dark:text-gray-300"
							for="description">Description</label
						>
						<input
							type="text"
							id="description"
							class="block w-full rounded-md border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800"
						/>
					</div>

					<div class="space-y-1">
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="amount"
							>Amount</label
						>
						<input
							type="number"
							id="amount"
							class="block w-full rounded-md border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800"
						/>
					</div>
					<div class="space-y-1">
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="category"
							>Category</label
						>
						<select
							id="category"
							class="block w-full rounded-md border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800"
						>
							<option value="">Select a category</option>
							{#each categories as category}
								<option value={category}>{category}</option>
							{/each}
						</select>
					</div>

					<button
						type="submit"
						class="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800"
					>
						Add Transaction
					</button>
				</form>
			</div>
		</div>
	</div>

	<!-- Charts Section -->
	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Suspicious transactions -->
		<Anomaly anomalies={transAnalysis.anomalies} {loading} />

		<!-- Spending Categories -->
		<SpendingCategories categories={transAnalysis.categories} {loading} />
	</div>

	<!-- Insights Section -->
	<div class="grid gap-6 sm:grid-cols-2">
		<!-- Saving rate -->
		{#if loading}
			{#each new Array(2) as _, i}
				<LoadingInsight />
			{/each}
		{:else if !transAnalysis.spending_trends}
			<div class="col-span-2 flex min-h-[200px] items-center justify-center">
				<Empty
					title="No insights available"
					description="No insights available for your account."
				/>
			</div>
		{:else}
			{#each getFinancialInsights(transAnalysis) as insight}
				<Insight {insight} />
			{/each}
		{/if}
	</div>
</div>
