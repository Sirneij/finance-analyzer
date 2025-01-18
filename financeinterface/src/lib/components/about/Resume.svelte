<script lang="ts">
	import Caret from '$lib/components/icons/Caret.svelte';
	import Experiences from '$lib/components/about/mini/Experiences.svelte';
	import EducationComp from '$lib/components/about/mini/Education.svelte';
	import SkillsComp from '$lib/components/about/mini/Skills.svelte';
	import type { Resume } from '$lib/types/resume.types';
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';

	let { resumeData }: { resumeData: Resume } = $props();

	let expandedExp = $state<number | null>(null),
		expandedSections = $state({
			experience: false,
			education: false,
			skills: false
		});

	const toggleSection = (section: keyof typeof expandedSections) => {
		expandedSections[section] = !expandedSections[section];
	};
</script>

<div class="mb-24 space-y-24 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800/50">
	<AnimatedSection class="space-y-20">
		<!-- Experience Timeline -->
		<section class="relative transform transition-all duration-500">
			<!-- Toggle button -->
			<button
				class="mb-8 flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
				onclick={() => toggleSection('experience')}
			>
				<h2 class="text-3xl font-bold text-gray-900 dark:text-white">Experience</h2>
				<Caret
					class="h-6 w-6 transform transition-transform duration-300"
					style={expandedSections.experience ? '' : 'transform: rotate(-90deg)'}
					trend="down"
				/>
			</button>

			<Experiences experiences={resumeData.experiences} {expandedSections} />
		</section>

		<!-- Education -->
		<section class="relative transform transition-all duration-300">
			<button
				class="mb-8 flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
				onclick={() => toggleSection('education')}
			>
				<h2 class="text-3xl font-bold text-gray-900 dark:text-white">Education</h2>
				<Caret
					class="h-6 w-6 transform transition-transform duration-300"
					style={expandedSections.education ? '' : 'transform: rotate(-90deg)'}
					trend="down"
				/>
			</button>

			<EducationComp education={resumeData.educations} {expandedSections} />
		</section>

		<!-- Skills -->
		<section class="transform transition-all duration-300">
			<button
				class="mb-8 flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
				onclick={() => toggleSection('skills')}
			>
				<h2 class="text-3xl font-bold text-gray-900 dark:text-white">Skills</h2>
				<Caret
					class="h-6 w-6 transform transition-transform duration-300"
					style={expandedSections.skills ? '' : 'transform: rotate(-90deg)'}
					trend="down"
				/>
			</button>

			<SkillsComp skills={resumeData.skills} {expandedSections} />
		</section>
	</AnimatedSection>
</div>
