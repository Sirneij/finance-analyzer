<script lang="ts">
	interface FinancialStats {
		total: number;
		change: number;
		trend: 'up' | 'down';
	}
	const cardData = {
		balance: 7250.0,
		cardNumber: '**** **** **** 4242',
		validThru: '12/25',
		name: 'John Doe'
	};

	const userStats = {
		income: { total: 5000, change: 8.2, trend: 'up' } as FinancialStats,
		expenses: { total: 3200, change: -2.4, trend: 'down' } as FinancialStats,
		savings: { total: 1800, change: 12.5, trend: 'up' } as FinancialStats
	};

	const insights = [
		{ title: 'Subscription Spending', value: '40%', description: 'of monthly expenses' },
		{ title: 'Entertainment Trend', value: '↑15%', description: 'increase this month' }
	];
	const transactions = [
		{
			id: 1,
			name: 'Netflix Subscription',
			amount: -15.99,
			date: '2024-02-20',
			type: 'subscription'
		},
		{ id: 2, name: 'Salary Deposit', amount: 5000.0, date: '2024-02-19', type: 'income' },
		{ id: 3, name: 'Grocery Store', amount: -85.5, date: '2024-02-18', type: 'expense' },
		{ id: 4, name: 'Freelance Payment', amount: 750.0, date: '2024-02-17', type: 'income' }
	];

	const chartData = {
		labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
		income: [4200, 4500, 4800, 5000, 5200],
		expenses: [3000, 3200, 3100, 3200, 3400]
	};
</script>

<div class="space-y-6">
	<!-- Welcome Section -->
	<div class="flex items-center justify-between rounded-lg bg-white p-6 dark:bg-gray-800">
		<div class="flex items-center space-x-4">
			<img
				src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
				alt="Profile"
				class="h-16 w-16 rounded-full ring-2 ring-blue-500"
			/>
			<div>
				<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, John!</h1>
				<p class="text-gray-600 dark:text-gray-400">Here's your financial overview</p>
			</div>
		</div>

		<div class="flex space-x-3">
			<button
				class="flex items-center space-x-2 rounded-lg bg-blue-50 px-4 py-2 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
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
				class="flex items-center space-x-2 rounded-lg bg-gray-50 px-4 py-2 text-gray-600 hover:bg-gray-100 dark:bg-gray-700/50 dark:text-gray-400 dark:hover:bg-gray-700"
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
					<p class="text-3xl font-bold">${cardData.balance.toLocaleString()}</p>
				</div>
				<div class="space-y-3">
					<p class="font-mono text-lg tracking-widest opacity-75">{cardData.cardNumber}</p>
					<div class="flex justify-between">
						<div>
							<p class="text-xs opacity-75">Valid Thru</p>
							<p class="font-mono">{cardData.validThru}</p>
						</div>
						<p class="self-end font-semibold">{cardData.name}</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Behavioral Insights -->
		<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
			<h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Behavioral Insights</h2>
			<div class="grid gap-4 sm:grid-cols-2">
				{#each insights as insight}
					<div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
						<h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">{insight.title}</h3>
						<p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{insight.value}</p>
						<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{insight.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Financial Summary Cards -->
	<div class="grid gap-6 sm:grid-cols-3">
		<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
			<div class="flex items-center justify-between">
				<h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Income</h3>
				<span
					class={`text-sm ${userStats.income.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}
				>
					{userStats.income.change}%
				</span>
			</div>
			<p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
				${userStats.income.total.toLocaleString()}
			</p>
		</div>

		<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
			<div class="flex items-center justify-between">
				<h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</h3>
				<span
					class={`text-sm ${userStats.expenses.trend === 'up' ? 'text-red-500' : 'text-green-500'}`}
				>
					{userStats.expenses.change}%
				</span>
			</div>
			<p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
				${userStats.expenses.total.toLocaleString()}
			</p>
		</div>

		<div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
			<div class="flex items-center justify-between">
				<h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Savings</h3>
				<span
					class={`text-sm ${userStats.savings.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}
				>
					{userStats.savings.change}%
				</span>
			</div>
			<p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
				${userStats.savings.total.toLocaleString()}
			</p>
		</div>
	</div>

	<!-- Charts + Transactions Grid -->
	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Financial Charts -->
		<div class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Financial Trends</h3>
				<div class="flex items-center gap-4">
					<span class="flex items-center text-sm text-gray-500 dark:text-gray-400">
						<span class="mr-1 h-3 w-3 rounded-full bg-blue-500"></span> Income
					</span>
					<span class="flex items-center text-sm text-gray-500 dark:text-gray-400">
						<span class="mr-1 h-3 w-3 rounded-full bg-red-500"></span> Expenses
					</span>
				</div>
			</div>
			<div class="h-64">
				<!-- Chart canvas will be mounted here -->
				<canvas id="financialTrends"></canvas>
			</div>
		</div>

		<!-- Recent Transactions -->
		<div class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
				<button class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
					>View All</button
				>
			</div>
			<div class="space-y-4">
				{#each transactions as tx}
					<div
						class="flex items-center justify-between rounded-lg border border-gray-100 p-4 dark:border-gray-700"
					>
						<div class="flex items-center space-x-3">
							<div
								class={`rounded-full p-2 ${
									tx.type === 'income'
										? 'bg-green-100 dark:bg-green-900/20'
										: tx.type === 'expense'
											? 'bg-red-100 dark:bg-red-900/20'
											: 'bg-blue-100 dark:bg-blue-900/20'
								}`}
							>
								<svg
									class={`h-5 w-5 ${
										tx.type === 'income'
											? 'text-green-600 dark:text-green-400'
											: tx.type === 'expense'
												? 'text-red-600 dark:text-red-400'
												: 'text-blue-600 dark:text-blue-400'
									}`}
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d={tx.type === 'income'
											? 'M5 10l7-7m0 0l7 7m-7-7v18'
											: tx.type === 'expense'
												? 'M19 14l-7 7m0 0l-7-7m7 7V3'
												: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'}
									/>
								</svg>
							</div>
							<div>
								<p class="font-medium text-gray-900 dark:text-white">{tx.name}</p>
								<p class="text-sm text-gray-500 dark:text-gray-400">
									{new Date(tx.date).toLocaleDateString()}
								</p>
							</div>
						</div>
						<span
							class={`font-medium ${
								tx.amount > 0
									? 'text-green-600 dark:text-green-400'
									: 'text-red-600 dark:text-red-400'
							}`}
						>
							{tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('en-US', {
								style: 'currency',
								currency: 'USD'
							})}
						</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
