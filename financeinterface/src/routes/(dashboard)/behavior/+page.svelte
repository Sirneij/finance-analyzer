<script lang="ts">
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

	function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files?.length) {
			// Handle file upload logic
		}
	}

	function handleSubmit() {
		// Handle form submission
	}
</script>

<div class="space-y-6 p-6">
	<div class="grid gap-6 lg:grid-cols-2">
		<!-- File Upload -->
		<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
			<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
				Upload Financial Data
			</h2>
			<div class="flex w-full items-center justify-center">
				<label
					class="group relative flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-all hover:border-blue-500 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-700/50 dark:hover:border-blue-400 dark:hover:bg-gray-700"
				>
					<div class="flex flex-col items-center justify-center pb-6 pt-5">
						<svg
							class="mb-4 h-8 w-8 text-gray-500 transition-colors group-hover:text-blue-500 dark:text-gray-400"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 20 16"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
							/>
						</svg>
						<p
							class="mb-2 text-sm text-gray-500 transition-colors group-hover:text-blue-500 dark:text-gray-400"
						>
							<span class="font-semibold">Click to upload</span> or drag and drop
						</p>
						<p class="text-xs text-gray-500 dark:text-gray-400">CSV or Excel files</p>
					</div>
					<input type="file" class="hidden" accept=".csv,.xlsx" on:change={handleFileUpload} />
				</label>
			</div>
		</div>

		<!-- Manual Input Form -->
		<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
			<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
				Manual Transaction Entry
			</h2>
			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				<div class="space-y-1">
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="date"
						>Date</label
					>
					<input
						type="date"
						id="date"
						bind:value={transaction.date}
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
						bind:value={transaction.description}
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
						bind:value={transaction.amount}
						class="block w-full rounded-md border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800"
					/>
				</div>
				<div class="space-y-1">
					<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="category"
						>Category</label
					>
					<select
						id="category"
						bind:value={transaction.category}
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
