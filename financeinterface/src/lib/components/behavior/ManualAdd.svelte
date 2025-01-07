<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import Loader from '$lib/components/resuables/Loader.svelte';

	let isAdding = $state(false);

	const handleSubmit: SubmitFunction = async () => {
		isAdding = true;
		return async ({ result, update }) => {
			isAdding = false;
			if (result.type === 'success' || result.type === 'redirect') {
				await update();
			}
			await applyAction(result);
		};
	};
</script>

<div class="h-[384px] rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
	<h2
		class="sticky top-0 mb-4 bg-white text-lg font-semibold text-gray-900 dark:bg-gray-800 dark:text-white"
	>
		Manual Transaction Entry
	</h2>
	<div class="h-[calc(100%-2rem)] overflow-y-auto">
		<form class="space-y-4" action="?/addTransaction" method="POST" use:enhance={handleSubmit}>
			<div class="space-y-1">
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="date">
					Date
				</label>
				<input
					type="date"
					name="date"
					class="block w-full rounded-md border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800"
				/>
			</div>

			<div class="space-y-1">
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="description">
					Description
				</label>
				<input
					type="text"
					name="description"
					class="block w-full rounded-md border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800"
				/>
			</div>

			<div class="space-y-1">
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="amount">
					Amount
				</label>
				<input
					type="text"
					inputmode="decimal"
					name="amount"
					class="block w-full rounded-md border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800"
				/>
			</div>
			<div class="space-y-1">
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="balance">
					Balance
				</label>
				<input
					type="text"
					inputmode="decimal"
					name="balance"
					class="block w-full rounded-md border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800"
				/>
			</div>

			{#if isAdding}
				<Loader width={20} message="Adding transaction..." />
			{:else}
				<button
					type="submit"
					class="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800"
				>
					Add Transaction
				</button>
			{/if}
		</form>
	</div>
</div>
