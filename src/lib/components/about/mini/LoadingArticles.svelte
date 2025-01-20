<div class="space-y-8">
	<!-- Series Skeletons -->
	{#each Array(2) as _}
		<div class="rounded-xl bg-gradient-to-br from-indigo-500/30 to-teal-500/30 p-[1px]">
			<div class="rounded-xl bg-gray-100 dark:bg-gray-800/50">
				<div class="p-4">
					<div class="flex items-center justify-between">
						<div class="h-7 w-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
						<div class="h-6 w-6 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
					</div>
				</div>
			</div>
		</div>
	{/each}

	<!-- Standalone Skeletons -->
	<div class="mt-12">
		<div class="mb-6 h-8 w-40 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
		<div class="relative w-full">
			<div class="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pl-4">
				{#each Array(3) as _}
					<div class="w-[350px] flex-none">
						<div class="h-48 animate-pulse rounded-t-xl bg-gray-200 dark:bg-gray-700"></div>
						<div class="space-y-4 p-4">
							<div class="h-6 w-3/4 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
							<div class="h-4 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
							<div class="flex items-center justify-between">
								<div class="h-4 w-20 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
								<div class="flex items-center space-x-2">
									<div class="h-4 w-16 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
									<div class="h-4 w-16 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
			<div
				class="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white dark:from-gray-800"
			></div>
			<div
				class="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white dark:from-gray-800"
			></div>
		</div>
	</div>
</div>
