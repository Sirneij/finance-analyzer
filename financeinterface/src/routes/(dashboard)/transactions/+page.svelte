<script lang="ts">
	import type { PageData } from './$types';
	import { formatMoney } from '$lib/utils/helpers/money.helpers';
	import { formatDate, isSameDay } from '$lib/utils/helpers/date.helpers';
	import type { Transaction } from '$lib/utils/types/transaction.types';

	let { data }: { data: PageData } = $props();

	const transactions: Transaction[] = data.transactions;
</script>

<div class="w-full space-y-4">
	<!-- Header Card -->
	<div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
		<h2 class="text-xl font-semibold text-gray-900 dark:text-white">Transaction History</h2>
		<p class="text-sm text-gray-600 dark:text-gray-400">
			Track and analyze your financial movements
		</p>
	</div>

	<!-- Table Container -->
	<div class="rounded-lg bg-white shadow-sm dark:bg-gray-800">
		<div class="w-full overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead class="sticky top-0 bg-gray-50 text-center text-xs uppercase dark:bg-gray-700">
					<tr>
						<th class="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">
							<div class="flex items-center space-x-2">
								<span>Date</span>
								<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
									/>
								</svg>
							</div>
						</th>
						<th class="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">Description</th>
						<th class="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">
							<div class="flex items-center space-x-2">
								<span>Amount</span>
								<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
						</th>
						<th class="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">
							<div class="flex items-center space-x-2">
								<span>Balance</span>
								<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
									/>
								</svg>
							</div>
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100 dark:divide-gray-700">
					{#each transactions as transaction}
						<tr class="group transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
							<td class="whitespace-nowrap px-6 py-4 text-gray-600 dark:text-gray-400">
								<div class="flex items-center space-x-2">
									<div
										class={`h-2 w-2 rounded-full ${
											isSameDay(transaction.date, new Date())
												? 'bg-blue-500'
												: 'bg-gray-300 dark:bg-gray-600'
										}`}
									></div>
									<span>
										{formatDate(transaction.date)}
									</span>
								</div>
							</td>
							<td class="px-6 py-4">
								<div class="flex items-center space-x-3">
									<span
										class={`flex h-8 w-8 items-center justify-center rounded-full ${
											transaction.type === 'income'
												? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
												: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
										}`}
									>
										<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d={transaction.type === 'income'
													? 'M5 10l7-7m0 0l7 7m-7-7v18'
													: 'M19 14l-7 7m0 0l-7-7m7 7V3'}
											/>
										</svg>
									</span>
									<span class="font-medium text-gray-900 dark:text-white">
										{transaction.description}
									</span>
								</div>
							</td>
							<td class="whitespace-nowrap px-6 py-4">
								<span
									class={`font-medium ${
										transaction.type === 'income'
											? 'text-green-600 dark:text-green-400'
											: 'text-red-600 dark:text-red-400'
									}`}
								>
									{transaction.type === 'income' ? '+' : '-'}{formatMoney(
										Math.abs(transaction.amount)
									)}
								</span>
							</td>
							<td class="whitespace-nowrap px-6 py-4">
								<span class="font-medium text-gray-900 dark:text-white">
									{formatMoney(transaction.balance)}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
