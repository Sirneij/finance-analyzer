<script lang="ts">
	import FormError from '$lib/components/resuables/FormError.svelte';
	import FileInput from '$lib/components/transactions/FileInput.svelte';
	import type { ActionData } from './$types';

	const { form }: { form: ActionData } = $props();

	interface Transaction {
		date: string;
		description: string;
		amount: number;
		category: string;
	}

	interface InsightMetric {
		title: string;
		value: string;
		trend: 'positive' | 'negative' | 'neutral';
		description: string;
	}

	let transaction: Transaction = {
		date: '',
		description: '',
		amount: 0,
		category: ''
	};

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

	const insights: InsightMetric[] = [
		{
			title: 'Savings Rate',
			value: '32%',
			trend: 'positive',
			description: 'You are saving 32% of your income'
		},
		{
			title: 'Spending Alert',
			value: '+15%',
			trend: 'negative',
			description: 'Excessive expenditure detected in the last month'
		}
	];
</script>

<div class="space-y-6 p-6">
	<FormError {form} />
	<div class="grid gap-6 lg:grid-cols-2">
		<!-- File Upload -->
		<FileInput />

		<!-- Manual Input Form -->
		<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
			<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
				Manual Transaction Entry
			</h2>
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

	<!-- Charts Section -->
	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Monthly Expense Trends -->
		<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
			<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
				Monthly Expense Trends
			</h2>
			<div class="h-64">
				<canvas id="expenseTrends"></canvas>
			</div>
		</div>

		<!-- Spending Categories -->
		<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
			<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Spending Categories</h2>
			<div class="h-64">
				<canvas id="spendingCategories"></canvas>
			</div>
		</div>
	</div>

	<!-- Insights Section -->
	<div class="grid gap-6 sm:grid-cols-2">
		{#each insights as insight}
			<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
				<div class="flex items-center justify-between">
					<h3 class="text-lg font-medium text-gray-900 dark:text-white">{insight.title}</h3>
					<span
						class={`text-lg font-bold ${
							insight.trend === 'positive'
								? 'text-green-500'
								: insight.trend === 'negative'
									? 'text-red-500'
									: 'text-gray-500'
						}`}
					>
						{insight.value}
					</span>
				</div>
				<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">{insight.description}</p>
			</div>
		{/each}
	</div>
</div>
