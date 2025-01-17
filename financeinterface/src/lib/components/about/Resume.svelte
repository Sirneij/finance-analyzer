<script lang="ts">
	import Caret from '$lib/components/icons/Caret.svelte';
	import Experiences from '$lib/components/about/mini/Experiences.svelte';
	import EducationComp from '$lib/components/about/mini/Education.svelte';
	import SkillsComp from '$lib/components/about/mini/Skills.svelte';
	import type { Experience, Education, Skills } from '$lib/types/resume.types';
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';

	const experiences: Experience[] = [
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

	const education: Education[] = [
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

	const skills: Skills = {
		'Programming Languages': ['TypeScript', 'Python', 'Java', 'Rust'],
		Frontend: ['Svelte', 'React', 'Vue.js', 'HTML/CSS'],
		Backend: ['Node.js', 'Django', 'Spring Boot'],
		Database: ['PostgreSQL', 'MongoDB', 'Redis'],
		'Cloud & DevOps': ['AWS', 'Docker', 'Kubernetes', 'CI/CD']
	};

	let expandedExp = $state<number | null>(null),
		expandedSections = $state({
			experience: false,
			education: false,
			skills: false
		});

	const toggleExpand = (index: number) => {
		expandedExp = expandedExp === index ? null : index;
	};

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

			<Experiences {experiences} {expandedSections} {toggleExpand} {expandedExp} />
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

			<EducationComp {education} {expandedSections} />
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

			<SkillsComp {skills} {expandedSections} />
		</section>
	</AnimatedSection>
</div>
