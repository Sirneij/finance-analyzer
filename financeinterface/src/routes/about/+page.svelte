<script lang="ts">
	import AnimatedContainer from '$lib/components/animations/AnimatedContainer.svelte';
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import TypewriterEffect from '$lib/components/animations/TypewriterEffect.svelte';
	import GitFork from '$lib/components/icons/GitFork.svelte';
	import GitStar from '$lib/components/icons/GitStar.svelte';
	import ThemeSwitcher from '$lib/components/resuables/ThemeSwitcher.svelte';
	import { GITHUB_USERNAME } from '$lib/utils/contants';
	import { marked } from 'marked';
	import { fade } from 'svelte/transition';

	let { data } = $props();

	let skills = [
		{ name: 'Frontend Development', level: 90 },
		{ name: 'Backend Development', level: 95 },
		{ name: 'Database Design', level: 90 },
		{ name: 'System Architecture', level: 85 }
	];

	const githubStats = [
		{ label: 'Public Repos', value: data.githubData.user.public_repos },
		{ label: 'Followers', value: data.githubData.user.followers },
		{ label: 'Following', value: data.githubData.user.following },
		{ label: 'Location', value: data.githubData.user.location }
	];

	let activeSeries: string | null = $state(null);
</script>

<svelte:head>
	<link
		rel="stylesheet"
		type="text/css"
		href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"
	/>
	<title>{data.githubData.user.name} - Portfolio</title>
	<meta name="description" content={data.githubData.user.bio} />
	<meta property="og:title" content={`${data.githubData.user.name} - Portfolio`} />
	<meta property="og:description" content={data.githubData.user.bio} />
	<meta property="og:image" content={data.githubData.user.avatar_url} />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<div
	class="min-h-screen bg-white p-8 text-gray-900 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 dark:text-gray-100"
>
	<!-- Theme Switcher -->
	<div class="fixed right-4 top-4 z-50">
		<ThemeSwitcher />
	</div>
	<AnimatedContainer class="mx-auto max-w-4xl">
		<!-- Hero Section -->

		<AnimatedSection class="mb-16 space-y-4 text-center" y={50}>
			<h1
				class="bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-5xl font-bold text-transparent dark:from-indigo-400 dark:to-teal-400"
			>
				{data.githubData.user.name}
			</h1>
			<p class="text-xl text-gray-600 dark:text-gray-400">
				<TypewriterEffect words={[data.githubData.user.bio]} loop delay={100} />
			</p>
		</AnimatedSection>

		<!-- Profile Section -->
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
									src={data.githubData.user.avatar_url}
									alt="Profile"
									class="h-full w-full rounded-full object-cover"
								/>
							</div>
						</div>
					</div>
				</div>

				<p class="leading-relaxed text-gray-600 dark:text-gray-400">
					{@html marked(data.githubData.specialRepo?.bio || data.githubData.user.bio)}
				</p>
				<div class="flex space-x-4">
					<a
						href="https://github.com/{GITHUB_USERNAME}"
						class="text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
					>
						GitHub
					</a>
					<a
						href="https://www.linkedin.com/in/john-owolabi-idogun/"
						class="text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
					>
						LinkedIn
					</a>
				</div>
			</AnimatedSection>

			<AnimatedSection
				class="rounded-xl bg-gray-100 p-6 backdrop-blur-sm dark:bg-gray-800/50"
				x={50}
			>
				<h3 class="mb-4 text-xl font-semibold">Technical Expertise</h3>
				<div class="space-y-4">
					{#each skills as skill}
						<div class="space-y-2">
							<div class="flex justify-between">
								<span>{skill.name}</span>
								<span>{skill.level}%</span>
							</div>
							<div class="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
								<div
									class="h-full rounded-full bg-gradient-to-r from-indigo-600 to-teal-600 dark:from-indigo-400 dark:to-teal-400"
									style="width: {skill.level}%"
									transition:fade
								></div>
							</div>
						</div>
					{/each}
				</div>
				<!-- New Tools/Languages Section -->
				<div class="mt-6">
					<div class="flex flex-wrap -space-x-4">
						{#each data.githubData.languages as tool, i}
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

		<AnimatedSection class="mb-16" y={50} delay={200}>
			<h2 class="mb-8 text-3xl font-semibold">GitHub Overview</h2>
			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{#each githubStats as stat}
					<div class="rounded-xl bg-gray-100 p-6 text-center dark:bg-gray-800/50">
						<h4 class="text-sm text-gray-600 dark:text-gray-400">{stat.label}</h4>
						<p class="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
							{stat.value}
						</p>
					</div>
				{/each}
			</div>
		</AnimatedSection>

		<AnimatedSection class="mb-16" y={50} delay={300}>
			<h2 class="mb-8 text-3xl font-semibold">Featured Repositories</h2>
			<div class="relative w-full">
				<!-- Scroll container -->
				<div class="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pl-4">
					{#each data.githubData.topRepos as repo}
						<a
							href={repo.html_url}
							target="_blank"
							rel="noopener noreferrer"
							class="-ml-4 w-[300px] flex-none transform snap-start rounded-xl bg-gray-100
								   p-6 transition-all duration-300 first:ml-0
								   hover:z-10 hover:-translate-y-2 hover:scale-105 hover:bg-gray-200
								   dark:bg-gray-800/50 dark:hover:bg-gray-800/70"
							style="scroll-snap-align: start;"
						>
							<h3
								class="mb-2 text-xl font-semibold group-hover:text-indigo-600
									  dark:group-hover:text-indigo-400"
							>
								{repo.name}
							</h3>
							<p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
								{repo.description || 'No description available'}
							</p>
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium text-gray-500 dark:text-gray-400">
									{repo.language || 'Various'}
								</span>
								<div class="flex items-center space-x-3">
									<div class="flex items-center space-x-1">
										<GitStar class="h-4 w-4 text-yellow-400" />
										<span class="text-sm font-medium text-gray-600 dark:text-gray-400">
											{repo.stargazers_count}
										</span>
									</div>
									<div class="flex items-center space-x-1">
										<GitFork class="h-4 w-4 text-gray-500 dark:text-gray-400" />
										<span class="text-sm font-medium text-gray-600 dark:text-gray-400">
											{repo.forks_count}
										</span>
									</div>
								</div>
							</div>
						</a>
					{/each}
				</div>

				<!-- Gradient fades for scroll indication -->
				<div
					class="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white dark:from-gray-800"
				></div>
				<div
					class="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white dark:from-gray-800"
				></div>
			</div>
		</AnimatedSection>

		<AnimatedSection class="rounded-xl bg-gray-100 p-6 backdrop-blur-sm dark:bg-gray-800/50" x={50}>
			<h3 class="mb-4 text-xl font-semibold">Latest Blog Posts</h3>

			<!-- Series Posts -->
			{#each data.githubData.specialRepo.blogs.series as series}
				<div class="mb-4">
					<button
						class="w-full rounded-lg bg-gray-50 p-3 text-left transition-all hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-700/50"
						onclick={() => (activeSeries = activeSeries === series.name ? null : series.name)}
					>
						<div class="flex items-center justify-between">
							<h4 class="text-lg font-medium text-gray-900 dark:text-gray-100">
								{series.name}
							</h4>
							<div class="flex items-center gap-2">
								<span class="text-sm text-gray-500">{series.posts.length} parts</span>
								<svg
									class="h-4 w-4 transform transition-transform {activeSeries === series.name
										? 'rotate-180'
										: ''}"
									viewBox="0 0 24 24"
								>
									<path fill="currentColor" d="M7 10l5 5 5-5z" />
								</svg>
							</div>
						</div>
					</button>

					{#if activeSeries === series.name}
						<div class="scrollbar-hide mt-2 overflow-x-auto">
							<div class="flex -space-x-3 px-3">
								{#each series.posts as post}
									<a
										href={post.url}
										target="_blank"
										rel="noopener noreferrer"
										class="group relative w-48 flex-none transform rounded-lg bg-gray-100 p-4
                                   shadow-sm transition-all duration-300 hover:z-10 hover:-translate-y-1
                                   hover:scale-105 dark:bg-gray-800/70"
									>
										<div class="text-sm font-medium text-gray-800 dark:text-gray-200">
											{typeof post.part === 'number' ? `Part ${post.part}` : post.part}
										</div>
										<div class="mt-1 truncate text-xs text-gray-500">
											{post.title}
										</div>
									</a>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/each}

			<!-- Standalone Posts -->
			{#if data.githubData.specialRepo.blogs.standalone.length > 0}
				<div class="mt-6">
					<h4 class="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">Other Posts</h4>
					<div class="space-y-2">
						{#each data.githubData.specialRepo.blogs.standalone as post}
							<a
								href={post.url}
								target="_blank"
								rel="noopener noreferrer"
								class="block transform rounded-lg p-3 transition-all duration-300
									   hover:-translate-x-1 hover:bg-gray-200 dark:hover:bg-gray-700/50"
							>
								<h5 class="font-medium text-gray-800 dark:text-gray-200">
									{post.title}
								</h5>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</AnimatedSection>
	</AnimatedContainer>
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
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
