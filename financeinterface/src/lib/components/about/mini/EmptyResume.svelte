<div class="mb-24 space-y-24 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800/50">
	<div class="space-y-20">
		<!-- Experience Section Skeleton -->
		<section>
			<div class="mb-8 flex items-center justify-between">
				<div class="h-8 w-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
				<div class="h-6 w-6 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
			</div>
			<!-- Experience Items -->
			{#each Array(3) as _}
				<div class="mb-8 ml-4 border-l-2 border-gray-200 pl-4 dark:border-gray-700">
					<div class="mb-2 h-6 w-3/4 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
					<div class="mb-2 h-4 w-1/2 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-600"></div>
					<div class="h-4 w-1/4 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-600"></div>
				</div>
			{/each}
		</section>

		<!-- Education Section Skeleton -->
		<section>
			<div class="mb-8 flex items-center justify-between">
				<div class="h-8 w-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
				<div class="h-6 w-6 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
			</div>
			<!-- Education Items -->
			{#each Array(2) as _}
				<div class="mb-8 ml-4 border-l-2 border-gray-200 pl-4 dark:border-gray-700">
					<div class="mb-2 h-6 w-2/3 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
					<div class="h-4 w-1/3 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-600"></div>
				</div>
			{/each}
		</section>

		<!-- Skills Section Skeleton -->
		<section>
			<div class="mb-8 flex items-center justify-between">
				<div class="h-8 w-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
				<div class="h-6 w-6 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
			</div>
			<!-- Skill Items -->
			<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
				{#each Array(8) as _}
					<div class="h-8 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
				{/each}
			</div>
		</section>
	</div>
</div>
