<script lang="ts">
	import type { PageData } from './$types';
	import { formatMoney } from '$lib/utils/helpers/money.helpers';
	import { formatDate, isSameDay } from '$lib/utils/helpers/date.helpers';
	import MoneyArrow from '$lib/components/icons/MoneyArrow.svelte';
	import Balance from '$lib/components/icons/Balance.svelte';
	import Amount from '$lib/components/icons/Amount.svelte';
	import Calendar from '$lib/components/icons/Calendar.svelte';
	import Empty from '$lib/components/resuables/Empty.svelte';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let visiblePages = $state<(number | string)[]>([]);

	function calculateVisiblePages(currentPage: number, total: number) {
		if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

		if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', total];
		if (currentPage >= total - 3)
			return [1, '...', total - 4, total - 3, total - 2, total - 1, total];

		return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', total];
	}

	async function handlePageChange(newPage: number) {
		await goto(`?page=${newPage}`, { invalidateAll: true });
	}

	$effect(() => {
		visiblePages = calculateVisiblePages(data.metadata.page, data.metadata.totalPages);
	});
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
					{#each data.transactions as transaction}
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
					{:else}
						<tr class="group transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
							<td class="px-6 py-4" colspan="4">
								<div class="flex items-center justify-center p-4">
									<Empty
										title="No data.transactions available"
										description="You have not made any data.transactions yet."
									/>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
	<div class="mt-4 rounded-lg bg-white shadow-sm dark:bg-gray-800">
		<div class="flex flex-col items-center justify-between gap-4 p-4 sm:flex-row">
			<!-- Results counter -->
			<div class="text-sm text-gray-600 dark:text-gray-400">
				Showing {(data.metadata.page - 1) * data.metadata.limit + 1} to {Math.min(
					data.metadata.page * data.metadata.limit,
					data.metadata.total
				)} of {data.metadata.total} results
			</div>

			<!-- Pagination controls -->
			<div class="flex items-center space-x-1">
				<button
					class="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
					disabled={data.metadata.page === 1}
					onclick={() => handlePageChange(data.metadata.page - 1)}
				>
					<svg class="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 19l-7-7 7-7"
						/>
					</svg>
					Previous
				</button>

				<div class="hidden sm:flex sm:items-center sm:space-x-1">
					{#each visiblePages as pageNum}
						{#if pageNum === '...'}
							<span class="px-2 text-gray-500 dark:text-gray-400">...</span>
						{:else}
							<button
								class="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors {data
									.metadata.page === pageNum
									? 'bg-blue-600 text-white hover:bg-blue-700'
									: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}"
								onclick={() => handlePageChange(pageNum as number)}
							>
								{pageNum}
							</button>
						{/if}
					{/each}
				</div>
				<button
					class="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
					disabled={data.metadata.page === data.metadata.totalPages}
					onclick={() => handlePageChange(data.metadata.page + 1)}
				>
					Next
					<svg class="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</button>
			</div>
		</div>
	</div>
</div>
