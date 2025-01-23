<script lang="ts">
	import type { ProgressSteps } from '$lib/types/notification.types';
	import Check from '$lib/components/icons/Check.svelte';

	let { steps }: { steps: ProgressSteps[] } = $props();
	const currentStep = $derived(
		steps.reduce((maxIndex, current, index, array) => {
			if (index === array.length - 1) return index;
			return current.progress > array[maxIndex].progress ? index : maxIndex;
		}, 0)
	);
</script>

<div class="relative max-h-full min-h-[16rem] w-full">
	<!-- Animated loading bars background -->
	<div class="absolute inset-0 z-0 h-full w-full">
		<div class="flex h-full w-full items-end justify-between gap-1.5 px-4">
			{#each Array(12) as i}
				<div
					class="w-full animate-[pulse_2s_ease-in-out_infinite] rounded-t-sm bg-gray-200 dark:bg-gray-700"
					style="height: {Math.random() * 80 + 10}%; animation-delay: {i * 150}ms;"
				></div>
			{/each}
		</div>
	</div>

	<!-- Progress steps overlay -->
	<div class="absolute inset-0 z-10 flex items-center justify-center">
		<div class="w-full max-w-2xl px-4">
			<div class="flex w-full items-center justify-between">
				{#each steps as step, i}
					<div class="relative flex flex-col items-center">
						<div
							class={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
								i < currentStep ? 'bg-indigo-600' : ''
							} ${i === currentStep ? 'border-2 border-indigo-600 bg-white dark:bg-gray-800' : ''} ${
								i > currentStep
									? 'border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
									: ''
							}`}
						>
							{#if i < currentStep}
								<Check class="h-5 w-5 text-white" />
							{:else if i === currentStep}
								<div class="h-3 w-3 animate-pulse rounded-full bg-indigo-600"></div>
							{/if}
						</div>

						<!-- Progress percentage -->
						<div
							class={`absolute w-24 text-center text-xs ${i % 2 === 0 ? '-top-6' : '-bottom-6'}`}
						>
							<span
								class={`transition-colors duration-300 ${
									i <= currentStep
										? 'font-medium text-indigo-600 dark:text-indigo-400'
										: 'text-gray-400 dark:text-gray-500'
								}`}
							>
								{step.progress * 100}%
							</span>
						</div>

						<div
							class={`absolute w-24 text-center text-xs ${i % 2 === 0 ? '-bottom-10' : '-top-10'}`}
						>
							<span
								class={`transition-colors duration-300 ${
									i <= currentStep
										? 'font-medium text-indigo-600 dark:text-indigo-400'
										: 'text-gray-400 dark:text-gray-500'
								}`}
							>
								{step.message}
							</span>
						</div>
					</div>

					{#if i < steps.length - 1}
						<div class="relative mx-2 h-px flex-1">
							<div
								class={`absolute inset-0 transition-all duration-300 ${
									i < currentStep ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
								}`}
							></div>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</div>
</div>
