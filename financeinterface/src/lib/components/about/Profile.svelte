<script>
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import { GITHUB_USERNAME } from '$lib/utils/contants';
	import { marked } from 'marked';
	import SkillChart from './SkillChart.svelte';

	let { resumeData, githubData } = $props();
</script>

<div class="mb-16 grid gap-8 md:grid-cols-2">
	<AnimatedSection class="space-y-6" x={-50}>
		<!-- Avatar -->
		<div class="mb-6 flex justify-center md:justify-start">
			<div class="relative h-48 w-48">
				<div
					class="animate-spin-slow absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 to-teal-600 p-1"
				>
					<div class="h-full w-full rounded-full bg-white dark:bg-gray-900">
						<img
							src={githubData.user.avatar_url}
							alt="Profile"
							class="h-full w-full rounded-full object-cover"
							loading="lazy"
						/>
					</div>
				</div>
			</div>
		</div>
		<h2 class="text-3xl font-semibold">Hello, I'm {githubData.user.name},</h2>
		<p
			class="mb-6 max-w-prose text-justify leading-8 tracking-wide text-gray-600 dark:text-gray-300"
		>
			{@html marked(resumeData.summary || githubData.specialRepo?.bio)}
		</p>
		<div class="flex space-x-4">
			<a
				href="https://github.com/{GITHUB_USERNAME}"
				class="relative overflow-hidden rounded-md px-2 py-1 text-indigo-600 transition-all duration-300 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg hover:after:origin-left hover:after:scale-x-100 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 dark:text-indigo-400 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-800"
			>
				GitHub
			</a>
			<a
				href="https://www.linkedin.com/in/john-owolabi-idogun/"
				class="relative overflow-hidden rounded-md px-2 py-1 text-indigo-600 transition-all duration-300 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg hover:after:origin-left hover:after:scale-x-100 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 dark:text-indigo-400 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-800"
			>
				LinkedIn
			</a>
		</div>
	</AnimatedSection>

	<AnimatedSection class="rounded-xl bg-gray-100 p-6 backdrop-blur-sm dark:bg-gray-800/50" x={50}>
		<h3 class="mb-4 text-xl font-semibold">Technical Expertise</h3>
		<div class="space-y-4">
			<SkillChart />
		</div>
		<!-- New Tools/Languages Section -->
		<div class="mt-6">
			<div class="flex flex-wrap -space-x-4">
				{#each githubData.languages as tool, i}
					<div
						class="relative mb-4 transform transition-all duration-300 hover:z-50 hover:-translate-y-2"
					>
						<div
							class="h-10 w-10 cursor-pointer rounded-full border-2 border-white bg-white transition-all duration-300
               hover:scale-125 hover:shadow-lg dark:border-gray-800 dark:bg-gray-800"
							style="z-index: {20 - i}"
							title={tool.name}
						>
							<img
								src={tool.icon}
								alt={tool.name}
								class="h-full w-full rounded-full object-contain p-1"
								loading="lazy"
							/>
						</div>
						<span
							class="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white
                 opacity-0 transition-opacity group-hover:opacity-100"
						>
							{tool.name}
						</span>
					</div>
				{/each}
			</div>
		</div>
	</AnimatedSection>
</div>

<style>
	@keyframes spin-slow {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin-slow {
		animation: spin-slow 10s linear infinite;
	}
</style>
