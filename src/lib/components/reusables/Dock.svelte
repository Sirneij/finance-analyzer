<script lang="ts">
	import { SLIDE_DURATION } from '$lib/utils/helpers/misc.transitions';
	import { fly, scale } from 'svelte/transition';
	import { elasticOut } from 'svelte/easing';
	import Collapse from '$lib/components/icons/Collapse.svelte';

	let { title = 'Filters', children } = $props();
	let isExpanded = $state(false);

	const toggleDock = () => {
		isExpanded = !isExpanded;
	};
</script>

<div class="fixed left-0 top-1/2 z-50 -translate-y-1/2">
	{#if !isExpanded}
		<button
			onclick={toggleDock}
			aria-label="Open {title}"
			title="Open {title}"
			in:scale={{ duration: 200, easing: elasticOut }}
			out:scale={{ duration: 200, easing: elasticOut }}
			class="flex h-10 w-10 items-center justify-center rounded-r-lg bg-white/90 shadow-lg
            backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-gray-50 hover:shadow-xl
            dark:bg-gray-800/90 dark:hover:bg-gray-700"
		>
			<Collapse
				class="h-5 w-5 text-gray-900 transition-transform duration-300 hover:scale-110 dark:text-gray-100"
				collapse={false}
			/>
		</button>
	{:else}
		<div
			in:fly={{ x: -300, duration: SLIDE_DURATION, easing: elasticOut }}
			out:fly={{ x: -300, duration: SLIDE_DURATION, easing: elasticOut }}
			class="w-64 rounded-r-lg bg-white/90 shadow-xl backdrop-blur-sm
            transition-all duration-300 hover:shadow-2xl dark:bg-gray-800/90"
		>
			<div class="max-h-[90vh] overflow-y-auto p-4">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
						{title}
					</h2>
					<button
						onclick={toggleDock}
						aria-label="Close {title}"
						title="Close {title}"
						class="rounded-full p-1 transition-all duration-300 hover:scale-105
                        hover:bg-gray-100 dark:hover:bg-gray-700"
					>
						<Collapse
							class="h-5 w-5 text-gray-900 transition-transform duration-300 hover:rotate-180 dark:text-gray-100"
						/>
					</button>
				</div>

				<div class="space-y-4">
					<div class="transition-all duration-300 hover:translate-x-1">
						{@render children()}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
