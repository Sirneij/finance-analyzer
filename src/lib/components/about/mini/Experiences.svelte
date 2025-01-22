<script lang="ts">
	import type { Experience } from '$lib/types/resume.types';
	import { SLIDE_DURATION } from '$lib/utils/helpers/misc.transitions';
	import { parseEndDate } from '$lib/utils/helpers/resume.helpers';
	import { normalizeTechnologyNameAndGetIcon } from '$lib/utils/helpers/technologies.helpers';
	import { slide } from 'svelte/transition';

	let {
		experiences,
		expandedSections = $bindable()
	}: { experiences: Experience[]; expandedSections: { experience: boolean } } = $props();

	let expandedExp = $state<number | null>(null);

	const toggleExpand = (index: number) => {
		expandedExp = expandedExp === index ? null : index;
	};

	const sortedExperiences: Experience[] = $derived(
		experiences
			.slice()
			.sort((a: Experience, b: Experience) => parseEndDate(b.period) - parseEndDate(a.period))
	);
</script>

{#if expandedSections.experience}
	<!-- Parent container has a slide in/out transition -->
	<div>
		<div class="relative">
			<!-- Vertical line behind items -->
			<div
				class="absolute left-0 h-[calc(100%-1rem)] w-0.5 bg-gradient-to-b from-indigo-500 to-teal-500 opacity-20"
			></div>

			<!-- The items themselves -->
			<div class="space-y-16" transition:slide={{ duration: SLIDE_DURATION }}>
				{#each sortedExperiences as exp, i (exp.company + exp.period)}
					<div
						class="group relative pl-8"
						role="button"
						tabindex="0"
						onclick={() => toggleExpand(i)}
						onkeydown={(e) => e.key === 'Enter' && toggleExpand(i)}
					>
						<!-- Timeline node -->
						<div class="absolute -left-2.5 flex h-5 w-5 items-center justify-center">
							<div
								class="h-5 w-5 rounded-full bg-gradient-to-tr from-indigo-500 to-teal-500 transition-transform duration-300 group-hover:scale-125"
							></div>
							<div class="absolute h-3 w-3 rounded-full bg-white dark:bg-gray-900"></div>
						</div>

						<!-- Card content -->
						<div
							class="rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/50"
						>
							<h3 class="text-xl font-bold text-gray-900 dark:text-white">{exp.role}</h3>
							<p class="text-gray-600 dark:text-gray-300">{exp.company} | {exp.period}</p>
							<p class="mt-2 text-sm italic text-gray-500 dark:text-gray-400">
								{exp.companyDescription}
							</p>

							<!-- Tech Stack -->
							<div class="mt-4 flex flex-wrap gap-2">
								{#each exp.techStack as tech}
									<span
										class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-50 to-teal-50 px-3 py-1 text-sm text-indigo-800 dark:from-indigo-900/30 dark:to-teal-900/30 dark:text-indigo-200"
									>
										{#if normalizeTechnologyNameAndGetIcon(tech)}
											<img
												src={normalizeTechnologyNameAndGetIcon(tech)}
												alt={tech}
												class="h-4 w-4"
												loading="lazy"
											/>
										{/if}
										{tech}
									</span>
								{/each}
							</div>

							<!-- Expandable content for achievements -->
							{#if expandedExp === i}
								<div transition:slide>
									<ul class="mt-4 space-y-2">
										{#each exp.achievements as achievement}
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
	</div>
{/if}
