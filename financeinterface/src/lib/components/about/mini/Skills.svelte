<script lang="ts">
	import type { Skills } from '$lib/types/resume.types';
	import { sequencedFly } from '$lib/utils/helpers/misc.transitions';
	import { normalizeTechnologyNameAndGetIcon } from '$lib/utils/helpers/technologies.helpers';
	import { slide } from 'svelte/transition';

	let {
		skills,
		expandedSections
	}: {
		skills: Skills;
		expandedSections: { skills: boolean };
	} = $props();

	const skillEntries = $derived(Object.entries(skills).filter(([key]) => key !== '_id'));
</script>

{#if expandedSections.skills}
	<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3" transition:slide={{ duration: 300 }}>
		{#each skillEntries as [category, categorySkills], i (category)}
			<div
				in:sequencedFly={{
					y: 100,
					x: -50,
					index: i,
					total: skillEntries.length,
					isEntering: true
				}}
				out:sequencedFly={{
					y: -100,
					x: 50,
					index: i,
					total: skillEntries.length,
					isEntering: false
				}}
				class="group rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:scale-105 dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/30"
			>
				<h3 class="mb-4 font-bold text-gray-900 dark:text-white">{category}</h3>
				<div class="flex flex-wrap gap-3">
					{#each categorySkills as skill}
						<div class="group/skill relative">
							<span
								class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-50 to-teal-50 px-4 py-1.5 text-sm font-medium text-indigo-800 transition-all duration-300 hover:from-indigo-100 hover:to-teal-100 dark:from-indigo-900/30 dark:to-teal-900/30 dark:text-indigo-200"
							>
								{#if normalizeTechnologyNameAndGetIcon(skill)}
									<img
										src={normalizeTechnologyNameAndGetIcon(skill)}
										alt={skill}
										class="h-4 w-4"
										loading="lazy"
									/>
								{/if}
								{skill}
							</span>
							<div
								class="absolute -top-12 left-1/2 hidden -translate-x-1/2 transform rounded-lg bg-gray-900 px-3 py-1 text-xs text-white group-hover/skill:block dark:bg-gray-700"
							>
								View projects
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
{/if}
