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
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300" for="description"
					>Description</label
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

			<button
				type="submit"
				class="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800"
			>
				Add Transaction
			</button>
		</form>
	</div>
</div>
