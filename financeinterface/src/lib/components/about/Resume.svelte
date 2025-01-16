<script lang="ts">
	import { onMount } from 'svelte';
	import AnimatedContainer from '$lib/components/animations/AnimatedContainer.svelte';
	import { fly, slide } from 'svelte/transition';

	let isVisible = $state(false);
	let expandedExp = $state<number | null>(null);
	let expandedSections = $state({
		experience: true,
		education: true,
		skills: true
	});

	const toggleSection = (section: keyof typeof expandedSections) => {
		expandedSections[section] = !expandedSections[section];
	};

	onMount(() => {
		isVisible = true;
	});

	const experiences = [
		{
			role: 'Senior Software Engineer',
			company: 'Tech Corp',
			companyDescription: 'A leading cloud solutions provider specializing in enterprise software',
			period: 'Jan 2020 - Present',
			description:
				'Led development of cloud-native applications, managing a team of 5 engineers and implementing microservices architecture',
			techStack: ['AWS', 'Kubernetes', 'Node.js', 'TypeScript', 'React'],
			achievements: [
				'Led team of 5 engineers',
				'Reduced deployment time by 60%',
				'Implemented CI/CD pipeline'
			]
		},
		{
			role: 'Software Engineer',
			company: 'Tech Startup',
			companyDescription: 'A fast-growing startup specializing in AI-driven solutions',
			period: 'Jun 2018 - Dec 2019',
			description:
				'Developed and maintained AI-driven applications, working closely with data scientists and product managers',
			techStack: ['Python', 'Django', 'React', 'PostgreSQL'],
			achievements: [
				'Developed AI-driven applications',
				'Collaborated with data scientists',
				'Maintained and improved existing applications'
			]
		},
		{
			role: 'Software Engineering Intern',
			company: 'Tech Corp',
			companyDescription: 'A leading cloud solutions provider specializing in enterprise software',
			period: 'Jan 2018 - May 2018',
			description:
				'Developed and maintained cloud-native applications, working closely with senior engineers and architects',
			techStack: ['Java', 'Spring Boot', 'React', 'PostgreSQL'],
			achievements: [
				'Developed cloud-native applications',
				'Collaborated with senior engineers',
				'Maintained and improved existing applications'
			]
		}
	];

	const education = [
		{
			degree: 'Master of Science in Computer Science',
			school: 'Tech University',
			location: 'San Francisco, CA',
			period: '2016 - 2018',
			description: 'Focus on Distributed Systems and Machine Learning'
		},
		{
			degree: 'Bachelor of Science in Software Engineering',
			school: 'State University',
			location: 'Boston, MA',
			period: '2012 - 2016',
			description: "Dean's List, Computer Science Society President"
		}
	];

	const skills = {
		'Programming Languages': ['TypeScript', 'Python', 'Java', 'Rust'],
		Frontend: ['Svelte', 'React', 'Vue.js', 'HTML/CSS'],
		Backend: ['Node.js', 'Django', 'Spring Boot'],
		Database: ['PostgreSQL', 'MongoDB', 'Redis'],
		'Cloud & DevOps': ['AWS', 'Docker', 'Kubernetes', 'CI/CD']
	};

	const toggleExpand = (index: number) => {
		expandedExp = expandedExp === index ? null : index;
	};
</script>

<div class="mb-24 space-y-24 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800/50">
	<AnimatedContainer class="space-y-20">
		<!-- Experience Timeline -->
		<section class="relative transform transition-all duration-500 hover:scale-[1.01]">
			<h2 class="mb-8 text-3xl font-bold text-gray-900 dark:text-white">Experience</h2>

			<div class="relative">
				<div
					class="absolute left-0 h-[calc(100%-1rem)] w-0.5 bg-gradient-to-b from-indigo-500 to-teal-500 opacity-20"
				></div>
				<div class="space-y-12">
					{#each experiences as exp, i}
						{#if isVisible}
							<div
								in:fly={{ x: -20, duration: 800, delay: i * 200 }}
								class="group relative pl-8"
								onclick={() => toggleExpand(i)}
								role="button"
								tabindex="0"
								onkeydown={(e) => e.key === 'Enter' && toggleExpand(i)}
							>
								<!-- Timeline Node -->
								<div class="absolute -left-2.5 flex h-5 w-5 items-center justify-center">
									<div
										class="h-5 w-5 rounded-full bg-gradient-to-tr from-indigo-500 to-teal-500 transition-transform duration-300 group-hover:scale-125"
									></div>
									<div class="absolute h-3 w-3 rounded-full bg-white dark:bg-gray-900"></div>
								</div>

								<!-- Content -->
								<div
									class="rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/50"
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
												class="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-50 to-teal-50 px-3 py-1 text-sm text-indigo-800 dark:from-indigo-900/30 dark:to-teal-900/30 dark:text-indigo-200"
											>
												<!-- <Icon icon="logos:{tech.toLowerCase()}" class="mr-1 h-4 w-4" /> -->
												{tech}
											</span>
										{/each}
									</div>
									<!-- Expandable Content -->
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
						{/if}
					{/each}
				</div>
			</div>
		</section>

		<!-- Education -->
		<section class="relative transform transition-all duration-300">
			<h2 class="mb-8 text-3xl font-bold text-gray-900 dark:text-white">Education</h2>

			<div class="relative">
				<div
					class="absolute left-0 h-[calc(100%-1rem)] w-0.5 bg-gradient-to-b from-indigo-500 to-teal-500 opacity-20"
				></div>

				<div class="space-y-12">
					{#each education as edu, i}
						{#if isVisible}
							<div in:fly={{ x: -20, duration: 800, delay: i * 200 }} class="group relative pl-8">
								<!-- Timeline Node -->
								<div class="absolute -left-2.5 z-10 flex h-5 w-5 items-center justify-center">
									<div
										class="h-5 w-5 rounded-full bg-gradient-to-tr from-indigo-500 to-teal-500 transition-transform duration-300 group-hover:scale-125"
									></div>
									<div class="absolute h-3 w-3 rounded-full bg-white dark:bg-gray-900"></div>
								</div>

								<!-- Content Card (moved hover scale here) -->
								<div
									class="rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/50"
								>
									<div class="flex items-center justify-between">
										<div>
											<h3 class="text-xl font-bold text-gray-900 dark:text-white">{edu.degree}</h3>
											<p class="text-gray-600 dark:text-gray-300">{edu.school}</p>
										</div>
										<span
											class="rounded-full bg-indigo-100 px-4 py-1 text-sm font-medium text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200"
										>
											{edu.period}
										</span>
									</div>
									<p class="mt-2 text-gray-500 dark:text-gray-400">{edu.location}</p>
									<p class="mt-4 text-gray-700 dark:text-gray-200">{edu.description}</p>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		</section>

		<!-- Skills -->
		<section class="transform transition-all duration-300">
			<h2 class="mb-8 text-3xl font-bold text-gray-900 dark:text-white">Skills</h2>

			<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each Object.entries(skills) as [category, categorySkills], i}
					{#if isVisible}
						<div
							in:fly={{ y: 20, duration: 800, delay: i * 200 }}
							class="group rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/50"
						>
							<h3 class="mb-4 font-bold text-gray-900 dark:text-white">{category}</h3>
							<div class="flex flex-wrap gap-3">
								{#each categorySkills as skill}
									<div class="group/skill relative">
										<span
											class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-50 to-teal-50 px-4 py-1.5 text-sm font-medium text-indigo-800 transition-all duration-300 hover:from-indigo-100 hover:to-teal-100 dark:from-indigo-900/30 dark:to-teal-900/30 dark:text-indigo-200"
										>
											<!-- <Icon icon="logos:{skill.toLowerCase()}" class="h-4 w-4" /> -->
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
					{/if}
				{/each}
			</div>
		</section>
	</AnimatedContainer>
</div>
