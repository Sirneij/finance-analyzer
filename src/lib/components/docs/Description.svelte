<script lang="ts">
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import { highlightCode, marked } from '$lib/utils/helpers/docs.helpers';
	import MethodBadge from './MethodBadge.svelte';
	import { getStatusColorClass } from '$lib/utils/helpers/docs.helpers';

	let { currentDoc } = $props();

	let descriptionContainer = $state<HTMLDivElement>();

	$effect(() => {
		if (descriptionContainer && currentDoc) {
			highlightCode(descriptionContainer);
		}
	});
</script>

<div class="space-y-8" bind:this={descriptionContainer}>
	<AnimatedSection y={20}>
		<h1 class="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl dark:text-white">
			{currentDoc.path}
		</h1>
		<div class="mt-4 flex flex-wrap items-center gap-2">
			<MethodBadge method={currentDoc.method} />

			<span class="text-sm text-gray-600 dark:text-gray-400">
				{currentDoc.category}
			</span>
		</div>
	</AnimatedSection>

	<AnimatedSection y={30} class="prose prose-blue dark:prose-invert max-w-none" delay={200}>
		{@html marked(currentDoc.description)}
	</AnimatedSection>

	{#if currentDoc.responses.length}
		<AnimatedSection y={40} class="space-y-4" delay={400}>
			<h2 class="text-2xl font-semibold text-gray-900 dark:text-white">Responses</h2>
			{#each currentDoc.responses as response}
				<div
					class="rounded-xl border border-gray-200 bg-white p-4 shadow-xs transition-all hover:shadow-md sm:p-6 dark:border-gray-700 dark:bg-gray-800"
				>
					<div class="mb-4 flex flex-wrap items-center gap-2">
						<span
							class="rounded-full bg-linear-to-r px-4 py-1 text-xs font-medium text-white shadow-sm {getStatusColorClass(
								response.status
							)}"
						>
							{response.status}
						</span>
						<span class="text-sm text-gray-600 dark:text-gray-400">
							{@html marked(response.description)}
						</span>
					</div>
					<div class="prose prose-blue dark:prose-invert max-w-none">
						{@html marked(response.example)}
					</div>
				</div>
			{/each}
		</AnimatedSection>
	{/if}
</div>
