<script lang="ts">
	type Crumb = {
		text: string;
		href?: string;
	};

	let { crumbs }: { crumbs: Crumb[] } = $props();
</script>

<nav class="mb-6" aria-label="Breadcrumb">
	<ol class="flex items-center space-x-2 text-sm">
		<li>
			<a
				href="/"
				class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
			>
				Home
			</a>
		</li>

		{#each crumbs as crumb, i}
			<li class="flex items-center">
				<span class="mx-2 text-gray-400 dark:text-gray-600">/</span>
				{#if i === crumbs.length - 1}
					<span class="font-medium text-gray-800 dark:text-gray-200">
						{crumb.text}
					</span>
				{:else}
					<a
						href={crumb.href}
						class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
					>
						{crumb.text}
					</a>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
