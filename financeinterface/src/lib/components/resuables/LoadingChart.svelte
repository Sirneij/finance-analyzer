<div class="flex h-full w-full items-end justify-between gap-2 px-4">
	{#each Array(12) as _, i}
		<div
			class="w-full animate-pulse bg-gray-200 dark:bg-gray-700"
			style="height: {Math.random() * 60 + 20}%; animation-delay: {i * 100}ms;"
		></div>
	{/each}
</div>
