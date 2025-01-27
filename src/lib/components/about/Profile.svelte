<script lang="ts">
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import { marked } from 'marked';
	import SkillChart from '$lib/components/about/SkillChart.svelte';
	import ParticleBackground from '$lib/components/about/mini/ParticleBackground.svelte';

	let { resumeData, githubData } = $props();
</script>

<div class="relative min-h-[600px] overflow-hidden">
	<!-- Particle Background -->
	<ParticleBackground />

	<!-- Main Content -->
	<div class="relative grid gap-8 md:grid-cols-2">
		<AnimatedSection class="space-y-8" x={-50}>
			<!-- Profile Section -->
			<div class="relative">
				<!-- Floating Avatar -->
				<div class="perspective-1000">
					<div
						class="hover:rotate-y-180 group relative h-56 w-56 transform-gpu transition-all duration-500"
					>
						<div class="absolute inset-0">
							<!-- Front -->
							<div class="relative h-full w-full rounded-2xl backdrop-blur-xl">
								<div
									class="animate-float absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-600/20 to-teal-600/20 p-1"
								>
									<div class="h-full w-full rounded-2xl bg-white/90 p-1 dark:bg-gray-900/90">
										<img
											src={githubData.user.avatar_url}
											alt="Profile"
											class="h-full w-full rounded-2xl object-cover"
											loading="lazy"
										/>
									</div>
								</div>
							</div>
							<!-- Back -->
							<div
								class="rotate-y-180 absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-600 to-teal-600 p-6 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
							>
								<div class="flex h-full flex-col justify-center text-center">
									<h3 class="text-xl font-bold">{githubData.user.name}</h3>
									<p class="mt-2 text-sm opacity-90">{githubData.user.bio}</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Bio Section -->
				<div class="mt-8 space-y-4">
					<h2 class="text-4xl font-bold tracking-tight">
						Hello, I'm
						<span
							class="bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent"
						>
							{githubData.user.name}
						</span>
					</h2>
					<p class="prose prose-lg dark:prose-invert text-justify">
						{@html marked(resumeData.summary || githubData.specialRepo?.bio)}
					</p>
				</div>

				<!-- Social Links -->
				<div class="mt-8 flex space-x-4">
					{#each [{ name: 'GitHub', url: `https://github.com/${githubData.user.login}` }, { name: 'LinkedIn', url: 'https://www.linkedin.com/in/john-owolabi-idogun/' }] as link}
						<a
							href={link.url}
							class="group relative rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-600 p-[1px] transition-all duration-300 hover:scale-110"
						>
							<div class="rounded-xl bg-white px-6 py-2 transition-colors dark:bg-gray-900">
								<span
									class="bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text font-medium text-transparent"
								>
									{link.name}
								</span>
							</div>
							<div
								class="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-20"
							>
								<div class="h-full w-full animate-pulse rounded-xl bg-white"></div>
							</div>
						</a>
					{/each}
				</div>
			</div>
		</AnimatedSection>

		<!-- Skills Section -->
		<AnimatedSection x={50}>
			<div class="space-y-8 rounded-2xl bg-white/80 p-8 backdrop-blur-xl dark:bg-gray-800/80">
				<h3 class="text-2xl font-bold">Technical Expertise</h3>
				<SkillChart />

				<!-- Tools Grid -->
				<div class="mt-8">
					<div class="flex flex-wrap -space-x-4">
						{#each githubData.languages as tool, i}
							<div
								class="group relative mb-4 transform transition-all duration-300 hover:z-50 hover:-translate-y-2"
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
			</div>
		</AnimatedSection>
	</div>
</div>

<style>
	.perspective-1000 {
		perspective: 1000px;
	}

	.rotate-y-180 {
		transform: rotateY(180deg);
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}

	.animate-float {
		animation: float 6s ease-in-out infinite;
	}
</style>
