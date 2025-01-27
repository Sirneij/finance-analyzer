<script lang="ts">
	import Caret from '$lib/components/icons/Caret.svelte';
	import Experiences from '$lib/components/about/mini/Experiences.svelte';
	import EducationComp from '$lib/components/about/mini/Education.svelte';
	import SkillsComp from '$lib/components/about/mini/Skills.svelte';
	import type { Resume } from '$lib/types/resume.types';
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import EmptyResume from '$lib/components/about/mini/EmptyResume.svelte';
	import { onMount } from 'svelte';
	import { fetchResume } from '$lib/utils/helpers/resume.helpers';
	import type { HTMLAttributes } from 'svelte/elements';
	import AnimatedContainer from '../animations/AnimatedContainer.svelte';
	import Work from '$lib/components/icons/Work.svelte';
	import Education from '$lib/components/icons/Education.svelte';
	import Skills from '$lib/components/icons/Skills.svelte';

	interface ResumeSectionProps extends HTMLAttributes<HTMLElement> {
		resumeData: Resume;
	}

	let { resumeData = $bindable() }: ResumeSectionProps = $props();

	let expandedSections = $state({
			experience: false,
			education: false,
			skills: false
		}),
		isLoading = $state(true);

	const toggleSection = (section: keyof typeof expandedSections) => {
		expandedSections[section] = !expandedSections[section];
	};

	$effect(() => {
		onMount(async () => {
			try {
				const data = await fetchResume();
				resumeData = data;
			} catch (error) {
				console.error(error);
			} finally {
				isLoading = false;
			}
		});
	});
</script>

{#if isLoading}
	<EmptyResume />
{:else if resumeData}
	<div class="mb-24 space-y-24 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800/50">
		<AnimatedSection class="space-y-20">
			<!-- Experience Timeline -->
			<section class="relative transform transition-all duration-500">
				<div class="group relative mb-8 flex w-full items-center">
					<!-- Icon positioned outside hover area -->
					<Work class="-ml-6 h-8 w-8 text-indigo-600 dark:text-indigo-400" />

					<!-- Button with hover effect -->
					<button
						class="flex flex-1 items-center justify-between rounded-lg p-2 pl-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
						onclick={() => toggleSection('experience')}
					>
						<h2 class="text-3xl font-bold text-gray-900 dark:text-white">Experience</h2>
						<Caret
							class="h-6 w-6 transform transition-transform duration-300"
							style={expandedSections.experience ? '' : 'transform: rotate(-90deg)'}
							trend="down"
						/>
					</button>
				</div>
				<Experiences experiences={resumeData.experiences} {expandedSections} />
			</section>

			<!-- Education -->
			<section class="relative transform transition-all duration-300">
				<div class="group relative mb-8 flex w-full items-center">
					<!-- Icon positioned outside hover area -->
					<Education class="-ml-6 h-8 w-8 text-indigo-600 dark:text-indigo-400" />

					<!-- Button with hover effect -->
					<button
						class="flex flex-1 items-center justify-between rounded-lg p-2 pl-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
						onclick={() => toggleSection('education')}
					>
						<h2 class="text-3xl font-bold text-gray-900 dark:text-white">Education</h2>
						<Caret
							class="h-6 w-6 transform transition-transform duration-300"
							style={expandedSections.education ? '' : 'transform: rotate(-90deg)'}
							trend="down"
						/>
					</button>
				</div>
				<EducationComp education={resumeData.educations} {expandedSections} />
			</section>

			<!-- Skills -->
			<section class="transform transition-all duration-300">
				<div class="group relative mb-8 flex w-full items-center">
					<!-- Icon positioned outside hover area -->
					<Skills class="-ml-6 h-8 w-8 text-indigo-600 dark:text-indigo-400" />

					<!-- Button with hover effect -->
					<button
						class="flex flex-1 items-center justify-between rounded-lg p-2 pl-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
						onclick={() => toggleSection('skills')}
					>
						<h2 class="text-3xl font-bold text-gray-900 dark:text-white">Skills</h2>
						<Caret
							class="h-6 w-6 transform transition-transform duration-300"
							style={expandedSections.skills ? '' : 'transform: rotate(-90deg)'}
							trend="down"
						/>
					</button>
				</div>
				<SkillsComp skills={resumeData.skills} {expandedSections} />
			</section>
		</AnimatedSection>
	</div>
{:else if !isLoading && !resumeData}
	<div class="mb-24 space-y-24 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800/50">
		<p class="text-3xl font-bold text-gray-900 dark:text-white">No resume data found</p>
	</div>
{/if}
