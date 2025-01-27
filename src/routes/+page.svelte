<script lang="ts">
	import { fly } from 'svelte/transition';
	import ThemeSwitcher from '$lib/components/reusables/ThemeSwitcher.svelte';
	import SEO from '$lib/components/about/SEO.svelte';
	import Profile from '$lib/components/about/Profile.svelte';
	import PlatformsOverview from '$lib/components/about/PlatformsOverview.svelte';
	import TopRepos from '$lib/components/about/TopRepos.svelte';
	import Hero from '$lib/components/about/Hero.svelte';
	import DevtoArticles from '$lib/components/about/DevArticles.svelte';
	import type { ProcessedDevToArticles } from '$lib/types/dev.to.types.js';
	import type { PageData } from './$types';
	import JI from '$lib/components/logos/JI.svelte';
	import ResumeComp from '$lib/components/about/Resume.svelte';
	import type { Resume } from '$lib/types/resume.types';
	import Footer from '$lib/components/about/Footer.svelte';
	import Dock from '$lib/components/reusables/Dock.svelte';
	import { SectionIcons } from '$lib/components/icons';
	import JoiArticles from '$lib/components/about/JOIArticles.svelte';

	let { data }: { data: PageData } = $props();

	let devtoArticles: ProcessedDevToArticles | null = $state(null),
		resumeData = $state({} as Resume),
		activeSection = $state('hero'),
		intersectingSections = $state<string[]>([]);

	function scrollToSection(id: string) {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	}

	$effect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						intersectingSections = [...intersectingSections, entry.target.id];
						activeSection = entry.target.id;
					} else {
						intersectingSections = intersectingSections.filter((id) => id !== entry.target.id);
					}
				});
			},
			{
				threshold: 0.5
			}
		);

		document.querySelectorAll('section[id]').forEach((section) => {
			observer.observe(section);
		});

		return () => observer.disconnect();
	});

	const sections = [
		{ id: 'hero', label: 'Home' },
		{ id: 'resume', label: 'Resume' },
		{ id: 'platforms', label: 'Platform' },
		{ id: 'top-repos', label: 'Repos' },
		{ id: 'articles', label: 'Articles' },
		{ id: 'dev-articles', label: 'DEVArticles' }
	];
</script>

<SEO {data} />

<div
	class="h-screen snap-y snap-mandatory overflow-y-auto scroll-smooth bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100"
>
	<!-- Logo -->
	<div class="fixed left-4 top-4 z-50">
		<a href="/" class="cursor-pointer" aria-label="Home">
			<JI
				size={40}
				class="text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
			/>
		</a>
	</div>

	<!-- Theme Switcher -->
	<div class="fixed right-4 top-4 z-50">
		<ThemeSwitcher />
	</div>
	<div class="relative">
		<!-- Hero Section -->
		<section
			id="hero"
			class="relative flex min-h-screen snap-start items-center justify-center px-4 py-20"
		>
			<div class="mx-auto w-full max-w-5xl overflow-hidden">
				<div class="relative">
					{#if intersectingSections.includes('hero')}
						<div
							in:fly={{ y: 50, duration: 1000 }}
							out:fly={{ y: -50, duration: 1000 }}
							class="max-h-[calc(100vh-10rem)] overflow-y-auto"
						>
							<div class="relative">
								<Hero githubUser={data.githubData.user} />
								<Profile {resumeData} githubData={data.githubData} />
								<!-- Fade overlay -->
								<div
									class="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-900"
								></div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</section>

		<!-- Resume Section -->
		<section
			id="resume"
			class="relative flex min-h-screen snap-start items-center justify-center px-4 py-20"
		>
			<div class="mx-auto w-full max-w-5xl overflow-hidden">
				<div class="relative">
					{#if intersectingSections.includes('resume')}
						<div
							in:fly={{ y: 50, duration: 1000 }}
							out:fly={{ y: -50, duration: 1000 }}
							class="max-h-[calc(100vh-10rem)] overflow-y-auto"
						>
							<div class="relative">
								<ResumeComp bind:resumeData />
								<div
									class="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-900"
								></div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</section>

		<!-- Platforms Overview -->
		<section
			id="platforms"
			class="relative flex min-h-screen snap-start items-center justify-center px-4 py-20"
		>
			<div class="mx-auto w-full max-w-5xl overflow-hidden">
				<div class="relative">
					{#if intersectingSections.includes('platforms')}
						<div
							in:fly={{ y: 50, duration: 1000 }}
							out:fly={{ y: -50, duration: 1000 }}
							class="max-h-[calc(100vh-10rem)] overflow-y-auto"
						>
							<div class="relative">
								<PlatformsOverview githubUser={data.githubData.user} bind:devtoArticles />
								<div
									class="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-900"
								></div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</section>

		<!-- Top Repos -->
		<section
			id="top-repos"
			class="relative flex min-h-screen snap-start items-center justify-center px-4 py-20"
		>
			<div class="mx-auto w-full max-w-5xl overflow-hidden">
				<div class="relative">
					{#if intersectingSections.includes('top-repos')}
						<div
							in:fly={{ y: 50, duration: 1000 }}
							out:fly={{ y: -50, duration: 1000 }}
							class="max-h-[calc(100vh-10rem)] overflow-y-auto"
						>
							<div class="relative">
								<TopRepos topRepos={data.githubData.topRepos} />
								<div
									class="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-900"
								></div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</section>

		<!-- Articles -->
		<section
			id="articles"
			class="relative flex min-h-screen snap-start items-center justify-center px-4 py-20"
		>
			<div class="mx-auto w-full max-w-5xl overflow-hidden">
				<div class="relative">
					{#if intersectingSections.includes('articles')}
						<div
							in:fly={{ y: 50, duration: 1000 }}
							out:fly={{ y: -50, duration: 1000 }}
							class="max-h-[calc(100vh-10rem)] overflow-y-auto"
						>
							<div class="relative">
								<JoiArticles articles={data.articles} />
								<div
									class="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-900"
								></div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</section>

		<!-- dev.to Articles -->
		<section
			id="dev-articles"
			class="relative flex min-h-screen snap-start items-center justify-center px-4 py-20"
		>
			<div class="mx-auto w-full max-w-5xl overflow-hidden">
				<div class="relative">
					{#if intersectingSections.includes('dev-articles')}
						<div
							in:fly={{ y: 50, duration: 1000 }}
							out:fly={{ y: -50, duration: 1000 }}
							class="max-h-[calc(100vh-10rem)] overflow-y-auto"
						>
							<div class="relative">
								<DevtoArticles bind:devtoArticles />
								<div
									class="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-900"
								></div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</section>
	</div>
	<Footer />
</div>

<Dock title="Navigation">
	<nav>
		<ul class="flex flex-col space-y-4">
			{#each sections as section}
				{@const Icon = SectionIcons[section.label as keyof typeof SectionIcons]}
				<li>
					<a
						href="#{section.id}"
						class="flex flex-col items-center space-y-1 {activeSection === section.id
							? 'text-indigo-500'
							: 'text-gray-500 hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-400'}"
						onclick={() => scrollToSection(section.id)}
						aria-current={activeSection === section.id ? 'page' : undefined}
					>
						<Icon class="h-6 w-6" />
						<span class="text-xs">{section.label}</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</Dock>
