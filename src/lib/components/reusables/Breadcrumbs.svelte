<script lang="ts">
	import { truncateTitle } from '$lib/utils/helpers/editor/blog.helpers';
	import Home from '../icons/Home.svelte';

	type Crumb = {
		text: string;
		href?: string;
	};

	let { crumbs }: { crumbs: Crumb[] } = $props();
	let innerWidth = $state(0);
</script>

<svelte:window bind:innerWidth />

<nav class="mb-6" aria-label="Breadcrumb">
	<ol class="flex items-center space-x-2 text-xs sm:text-sm md:text-base">
		<li>
			<a
				href="/"
				class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
				title="Home"
				aria-label="Home"
			>
				<Home class="h-5 w-6" />
			</a>
		</li>

		{#each crumbs as crumb, i}
			<li class="flex items-center">
				<span class="mx-2 text-gray-400 dark:text-gray-600">/</span>
				{#if i === crumbs.length - 1}
					<span
						class="font-medium text-gray-800 dark:text-gray-200"
						title={crumb.text}
						aria-label={crumb.text}
					>
						{truncateTitle(crumb.text, innerWidth)}
					</span>
				{:else}
					<a
						href={crumb.href}
						class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
						title={crumb.text}
						aria-label={crumb.text}
					>
						{truncateTitle(crumb.text, innerWidth)}
					</a>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
