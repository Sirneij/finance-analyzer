<script lang="ts">
	import AnimatedContainer from '$lib/components/animations/AnimatedContainer.svelte';
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import TypewriterEffect from '$lib/components/animations/TypewriterEffect.svelte';
	import GitFork from '$lib/components/icons/GitFork.svelte';
	import GitStar from '$lib/components/icons/GitStar.svelte';
	import ThemeSwitcher from '$lib/components/resuables/ThemeSwitcher.svelte';
	import { CONTACT_EMAIL, GITHUB_USERNAME, TESTIMONIALS } from '$lib/utils/contants';
	import { marked } from 'marked';
	import { fade } from 'svelte/transition';
	import SkillChart from '$lib/components/about/SkillChart.svelte';
	import Email from '$lib/components/icons/Email.svelte';
	import SEO from '$lib/components/about/SEO.svelte';
	import { decodeEmail, encodeEmail } from '$lib/utils/helpers/email.helpers.js';

	let { data } = $props();

	let skills = [
		{ name: 'Frontend Development', level: 90 },
		{ name: 'Backend Development', level: 95 },
		{ name: 'Database Design', level: 90 },
		{ name: 'System Architecture', level: 85 }
	];

	const githubStats = [
		{
			label: 'Public Repos',
			value: data.githubData.user.public_repos,
			icon: 'M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z'
		},
		{
			label: 'Followers',
			value: data.githubData.user.followers,
			icon: 'M2 5.5a3.5 3.5 0 115.898 2.549 5.507 5.507 0 013.034 4.084.75.75 0 11-1.482.235 4.001 4.001 0 00-7.9 0 .75.75 0 01-1.482-.236A5.507 5.507 0 013.102 8.05 3.49 3.49 0 012 5.5zM11 4a3.001 3.001 0 012.22 5.018 5.01 5.01 0 012.56 3.012.749.749 0 01-.885.954.752.752 0 01-.549-.514 3.507 3.507 0 00-2.522-2.372.75.75 0 01-.574-.73v-.352a.75.75 0 01.416-.672A1.5 1.5 0 0011 5.5.75.75 0 0111 4zm-5.5-.5a2 2 0 10-.001 3.999A2 2 0 005.5 3.5z'
		},
		{
			label: 'Following',
			value: data.githubData.user.following,
			icon: 'M10.5 5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm.061 3.073a4 4 0 00-5.123 0 .75.75 0 00.284 1.105l.31.155A3.29 3.29 0 018 9.875c.702 0 1.372-.109 2.033-.542l.31-.155a.75.75 0 00.284-1.105 4 4 0 00-1.592-.925zm0 0'
		},
		{
			label: 'Location',
			value: data.githubData.user.location,
			icon: 'M6 0C2.687 0 0 2.687 0 6c0 4.5 6 10 6 10s6-5.5 6-10c0-3.313-2.687-6-6-6zm0 8.3a2.3 2.3 0 110-4.6 2.3 2.3 0 010 4.6z'
		}
	];

	let activeSeries: string | null = $state(null);

	const encodedEmail = encodeEmail(`${CONTACT_EMAIL}`);

	const handleEmailClick = (e: MouseEvent) => {
		e.preventDefault();
		window.location.href = `mailto:${decodeEmail(encodedEmail)}`;
	};
</script>

<SEO {data} />

<div
	class="min-h-screen bg-white p-8 text-gray-900 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 dark:text-gray-100"
>
	<!-- Theme Switcher -->
	<div class="fixed right-4 top-4 z-50">
		<ThemeSwitcher />
	</div>
	<AnimatedContainer class="mx-auto max-w-4xl space-y-24">
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

			<!-- New Contact Button -->
			<div class="mt-8">
				<a
					href="#contact"
					onclick={handleEmailClick}
					class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-teal-600 px-6 py-3 text-white transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 dark:from-indigo-400 dark:to-teal-400 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-800"
				>
					<Email class="h-5 w-5" />
					Contact Me
				</a>
			</div>
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
									loading="lazy"
								/>
							</div>
						</div>
					</div>
				</div>

				<p class="mb-6 max-w-prose leading-8 tracking-wide text-gray-600 dark:text-gray-300">
					{@html marked(data.githubData.specialRepo?.bio || data.githubData.user.bio)}
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

		<SkillChart {skills} githubData={data.githubData} />

		<AnimatedSection class="space-y-12" y={50} delay={200}>
			<h2 class="mb-8 text-3xl font-semibold">GitHub Overview</h2>
			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{#each githubStats as stat}
					<div
						class="group relative rounded-xl bg-gradient-to-br from-indigo-500/30 to-teal-500/30 p-[1px] transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-110 hover:shadow-xl hover:shadow-indigo-500/20"
					>
						<div class="relative h-full rounded-xl bg-gray-100 p-6 text-center dark:bg-gray-800/50">
							<div
								class="absolute -top-4 left-1/2 -translate-x-1/2 transform rounded-full bg-gradient-to-r from-indigo-600 to-teal-600 p-3 text-white shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:rotate-12 group-hover:shadow-xl dark:from-indigo-400 dark:to-teal-400"
							>
								<svg
									viewBox="0 0 16 16"
									class="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
									fill="currentColor"
								>
									<path d={stat.icon} />
								</svg>
							</div>
							<h4 class="mt-4 text-sm text-gray-600 dark:text-gray-400">{stat.label}</h4>
							<p
								class="mt-2 bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-2xl font-bold text-transparent transition-all duration-300 group-hover:scale-110 dark:from-indigo-400 dark:to-teal-400"
							>
								{stat.value}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</AnimatedSection>

		<AnimatedSection class="space-y-12" y={50} delay={300}>
			<h2 class="mb-8 text-3xl font-semibold">Featured Repositories</h2>
			<div class="relative w-full">
				<!-- Scroll container -->
				<div class="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pl-4">
					{#each data.githubData.topRepos as repo}
						<a
							href={repo.html_url}
							target="_blank"
							rel="noopener noreferrer"
							class="-ml-4 w-[300px] flex-none transform snap-start rounded-xl bg-gray-100 p-6 transition-all duration-300 first:ml-0 hover:z-10 hover:-translate-y-2
								   hover:scale-105 hover:bg-gray-200 focus:outline-none focus:ring-2
								   focus:ring-indigo-600 focus:ring-offset-4 dark:bg-gray-800/50 dark:hover:bg-gray-800/70
								   dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-800"
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

		<AnimatedSection
			class="space-y-8 rounded-xl bg-gray-100 p-8 backdrop-blur-sm dark:bg-gray-800/50"
			x={50}
		>
			<h2 class="mb-8 text-3xl font-semibold">Latest Blog Posts</h2>

			<!-- Series Posts -->
			{#each data.githubData.specialRepo.blogs.series as series}
				<div class="mb-4">
					<button
						class="w-full rounded-lg bg-gray-50 p-3 text-left transition-all hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 dark:bg-gray-800/50 dark:hover:bg-gray-700/50 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-800"
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
										class="group relative block w-48 flex-none transform rounded-lg bg-gray-100 p-4 shadow-sm transition-all duration-300 hover:z-10 hover:-translate-y-1 hover:scale-105
                                   focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 dark:bg-gray-800/70
                                   dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-800"
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
					<h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">Other Posts</h3>
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
		<script lang="ts">
			// ...existing imports...

			const testimonials: Testimonial[] = [
				{
					name: 'John Doe',
					title: 'Senior Developer at Tech Co',
					text: 'Exceptional problem-solving skills and attention to detail. Delivered outstanding results.',
					image: '/path/to/image.jpg',
					link: 'https://linkedin.com/in/johndoe'
				}
				// Add more testimonials...
			];
		</script>

		<!-- Add before closing AnimatedContainer -->
		<AnimatedSection class="space-y-8" y={50} delay={400}>
			<h2 class="mb-8 text-3xl font-semibold">Testimonials</h2>

			<div class="relative w-full">
				<div class="scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4">
					{#each TESTIMONIALS as testimonial}
						<div
							class="group w-[350px] flex-none transform snap-start rounded-xl bg-gradient-to-br from-indigo-500/30 to-teal-500/30 p-[1px] transition-all duration-500 hover:-translate-y-1 hover:scale-105"
						>
							<div class="relative h-full rounded-xl bg-gray-100 p-6 dark:bg-gray-800/50">
								<!-- Quote Icon -->
								<div class="absolute -top-4 right-6">
									<div
										class="rounded-full bg-gradient-to-r from-indigo-600 to-teal-600 p-3 text-white shadow-lg dark:from-indigo-400 dark:to-teal-400"
									>
										<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
											<path
												d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"
											/>
										</svg>
									</div>
								</div>

								<!-- Content -->
								<div class="mt-4 space-y-4">
									<p class="text-gray-600 dark:text-gray-300">
										"{testimonial.text}"
									</p>

									<!-- Author -->
									<div class="flex items-center gap-4">
										{#if testimonial.image}
											<img
												src={testimonial.image}
												alt={testimonial.name}
												class="h-12 w-12 rounded-full object-cover"
												loading="lazy"
											/>
										{/if}

										<div>
											{#if testimonial.link}
												<a
													href={testimonial.link}
													target="_blank"
													rel="noopener noreferrer"
													class="font-medium text-gray-900 hover:text-indigo-600 dark:text-gray-100 dark:hover:text-indigo-400"
												>
													{testimonial.name}
												</a>
											{:else}
												<span class="font-medium text-gray-900 dark:text-gray-100">
													{testimonial.name}
												</span>
											{/if}

											{#if testimonial.title}
												<p class="text-sm text-gray-500">
													{testimonial.title}
												</p>
											{/if}
										</div>
									</div>
								</div>
							</div>
						</div>
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
