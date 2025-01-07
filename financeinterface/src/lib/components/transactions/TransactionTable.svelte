<script lang="ts">
	import Calendar from '$lib/components/icons/Calendar.svelte';
	import { formatDate, isSameDay } from '$lib/utils/helpers/date.helpers';
	import { formatMoney } from '$lib/utils/helpers/money.helpers';
	import Amount from '$lib/components/icons/Amount.svelte';
	import Balance from '$lib/components/icons/Balance.svelte';
	import MoneyArrow from '$lib/components/icons/MoneyArrow.svelte';
	import Empty from '$lib/components/resuables/Empty.svelte';
	import type { Transaction } from '$lib/types/transaction.types';
	import { applyAction, enhance } from '$app/forms';
	import { fade } from 'svelte/transition';
	import Delete from '$lib/components/icons/Delete.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { transactions = $bindable() }: { transactions: Transaction[] } = $props();

	let hoveredTransaction = $state<string | null>(null),
		selectedTransactions = $state<Set<string>>(new Set());

	function toggleAll(event: Event) {
		const checked = (event.target as HTMLInputElement).checked;
		selectedTransactions = new Set(checked ? transactions.map((t) => t._id) : []);
	}

	function toggleSelection(id: string) {
		const newSet = new Set(selectedTransactions);
		if (newSet.has(id)) {
			newSet.delete(id);
		} else {
			newSet.add(id);
		}
		selectedTransactions = newSet;
	}

	const handleDelete: SubmitFunction = async () => {
		return async ({ result, update }) => {
			if (result.type === 'success' || result.type === 'redirect') {
				selectedTransactions.clear();
				await update();
			}
			await applyAction(result);
		};
	};
</script>

<!-- Header Card with Delete Action -->
<div class="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-xl font-semibold text-gray-900 dark:text-white">Transaction History</h2>
			<p class="text-sm text-gray-600 dark:text-gray-400">
				Track and analyze your financial movements
			</p>
		</div>

		{#if selectedTransactions.size > 0}
			<form method="POST" action="?/deleteTransactions" use:enhance={handleDelete}>
				<input
					type="hidden"
					name="transactions"
					value={Array.from(selectedTransactions).join(',')}
				/>
				<button
					class="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
					type="submit"
					transition:fade
				>
					<Delete class="h-5 w-5" />
					Delete Selected ({selectedTransactions.size})
				</button>
			</form>
		{/if}
	</div>
</div>

<!-- Table Container -->
<div class="rounded-lg bg-white shadow-sm dark:bg-gray-800">
	<div class="w-full overflow-x-auto">
		<table class="w-full text-left text-sm">
			<thead class="sticky top-0 bg-gray-50 text-center text-xs uppercase dark:bg-gray-700">
				<tr>
					<th class="px-6 py-4">
						<input
							type="checkbox"
							class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
							onchange={toggleAll}
							checked={selectedTransactions.size === transactions.length && transactions.length > 0}
						/>
					</th>
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
					<th></th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-100 dark:divide-gray-700">
				{#each transactions as transaction}
					<tr
						class="group relative transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
						onmouseenter={() => (hoveredTransaction = transaction._id)}
						onmouseleave={() => (hoveredTransaction = null)}
					>
						<td class="px-6 py-4">
							<input
								type="checkbox"
								class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
								checked={selectedTransactions.has(transaction._id)}
								onchange={() => toggleSelection(transaction._id)}
							/>
						</td>
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
						<td>
							{#if hoveredTransaction === transaction._id && !selectedTransactions.size}
								<form method="POST" action="?/deleteTransactions" use:enhance={handleDelete}>
									<input type="hidden" name="transactions" value={transaction._id} />
									<button
										class="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100 dark:hover:bg-gray-700 dark:hover:text-gray-300"
										type="submit"
										aria-label="Delete transaction"
									>
										<Delete class="h-4 w-4" />
									</button>
								</form>
							{/if}
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
