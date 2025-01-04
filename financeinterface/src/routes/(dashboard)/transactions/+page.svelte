<script lang="ts">
	import type { PageData } from './$types';
	import { formatMoney } from '$lib/utils/helpers/money.helpers';
	import { formatDate, isSameDay } from '$lib/utils/helpers/date.helpers';
	import type { Transaction } from '$lib/types/transaction.types';
	import MoneyArrow from '$lib/components/icons/MoneyArrow.svelte';
	import Balance from '$lib/components/icons/Balance.svelte';
	import Amount from '$lib/components/icons/Amount.svelte';
	import Calendar from '$lib/components/icons/Calendar.svelte';

	let { data }: { data: PageData } = $props();

	const transactions: Transaction[] = data.transactions;

	$inspect(transactions);
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
								<Calendar class="h-4 w-4" />
							</div>
						</th>
						<th class="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">Description</th>
						<th class="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">
							<div class="flex items-center space-x-2">
								<span>Amount</span>
								<Amount class="h-4 w-4 " />
							</div>
						</th>
						<th class="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">
							<div class="flex items-center space-x-2">
								<span>Balance</span>
								<Balance class="h-4 w-4" />
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
										<MoneyArrow txType={transaction.type} />
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
