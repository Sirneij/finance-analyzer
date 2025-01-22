<script lang="ts">
	import type { Education } from '$lib/types/resume.types';
	import { SLIDE_DURATION } from '$lib/utils/helpers/misc.transitions';
	import { parseEndDate } from '$lib/utils/helpers/resume.helpers';
	import { stripOffCGPAFronDegree } from '$lib/utils/helpers/technologies.helpers';
	import { slide } from 'svelte/transition';

	let {
		education,
		expandedSections
	}: { education: Education[]; expandedSections: { education: boolean } } = $props();

	let expandedEdu = $state<number | null>(null);

	const toggleExpand = (index: number) => {
		expandedEdu = expandedEdu === index ? null : index;
	};

	const sortedEducation: Education[] = $derived(
		education
			.slice()
			.sort((a: Education, b: Education) => parseEndDate(b.period) - parseEndDate(a.period))
	);
</script>

{#if expandedSections.education}
	<div class="relative">
		<div
			class="absolute left-0 h-[calc(100%-1rem)] w-0.5 bg-gradient-to-b from-indigo-500 to-teal-500 opacity-20"
		></div>
		<div class="space-y-16" transition:slide={{ duration: SLIDE_DURATION }}>
			{#each sortedEducation as edu, i (edu.school + edu.period)}
				<div
					class="group relative pl-8"
					role="button"
					tabindex="0"
					onclick={() => toggleExpand(i)}
					onkeydown={(e) => e.key === 'Enter' && toggleExpand(i)}
				>
					<!-- Timeline Node -->
					<div class="absolute -left-2.5 flex h-5 w-5 items-center justify-center">
						<div
							class="h-5 w-5 rounded-full bg-gradient-to-tr from-indigo-500 to-teal-500 transition-transform duration-300 group-hover:scale-125"
						></div>
						<div class="absolute h-3 w-3 rounded-full bg-white dark:bg-gray-900"></div>
					</div>

					<!-- Content Card -->
					<div
						class="rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/50"
					>
						<div class="flex items-center justify-between">
							<div>
								<h3 class="text-xl font-bold text-gray-900 dark:text-white">
									{stripOffCGPAFronDegree(edu.degree)}
								</h3>
								<p class="text-gray-600 dark:text-gray-300">{edu.school}</p>
							</div>
							<span
								class="rounded-full bg-indigo-100 px-4 py-1 text-sm font-medium text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200"
							>
								{edu.period}
							</span>
						</div>
						<p class="mt-2 text-sm italic text-gray-500 dark:text-gray-400">
							{edu.schoolDescription}
						</p>
						<p class="mt-2 text-gray-500 dark:text-gray-400">{edu.location}</p>

						<!-- Expandable content for achievements -->
						{#if expandedEdu === i}
							<div transition:slide>
								<ul class="mt-4 space-y-2">
									{#each edu.achievements as achievement}
										<li class="flex items-center text-gray-700 dark:text-gray-200">
											<span class="mr-2 text-indigo-500">•</span>
											{achievement}
										</li>
									{/each}
								</ul>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}
