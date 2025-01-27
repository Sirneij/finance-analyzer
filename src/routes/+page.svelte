<script lang="ts">
	import AnimatedContainer from '$lib/components/animations/AnimatedContainer.svelte';
	import ThemeSwitcher from '$lib/components/reusables/ThemeSwitcher.svelte';
	import SEO from '$lib/components/about/SEO.svelte';
	import Profile from '$lib/components/about/Profile.svelte';
	import PlatformsOverview from '$lib/components/about/PlatformsOverview.svelte';
	import TopRepos from '$lib/components/about/TopRepos.svelte';
	import Hero from '$lib/components/about/Hero.svelte';
	import Articles from '$lib/components/about/DevArticles.svelte';
	import type { ProcessedDevToArticles } from '$lib/types/dev.to.types.js';
	import type { PageData } from './$types';
	import JI from '$lib/components/logos/JI.svelte';
	import ResumeComp from '$lib/components/about/Resume.svelte';
	import type { Resume } from '$lib/types/resume.types';
	import Footer from '$lib/components/about/Footer.svelte';
	import Dock from '$lib/components/reusables/Dock.svelte';
	import GitFork from '$lib/components/icons/GitFork.svelte';
	import { SectionIcons } from '$lib/components/icons';

	let { data }: { data: PageData } = $props();

	let devtoArticles: ProcessedDevToArticles | null = $state(null),
		resumeData = $state({} as Resume),
		activeSection = $state('hero');

	function scrollToSection(id: string) {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	}

	// Track active section on scroll
	$effect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
						activeSection = entry.target.id;
					}
				});
			},
			{
				threshold: [0.3, 0.5, 0.7],
				rootMargin: '-10% 0px -10% 0px'
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
		{ id: 'dev-articles', label: 'Articles' }
	];
</script>

<SEO {data} />

<div class="relative min-h-screen bg-white p-8 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
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
	<AnimatedContainer class="mx-auto max-w-4xl space-y-24">
		<!-- Hero Section -->
		<Hero githubUser={data.githubData.user} id="hero" />

		<!-- Profile Section -->
		<Profile {resumeData} githubData={data.githubData} />

		<!-- Resume only when rug -->

		<ResumeComp bind:resumeData id="resume" />

		<!-- GitHub Overview -->
		<PlatformsOverview githubUser={data.githubData.user} bind:devtoArticles id="platforms" />

		<!-- Top Repos -->
		<TopRepos topRepos={data.githubData.topRepos} id="top-repos" />

		<Articles bind:devtoArticles id="dev-articles" />
	</AnimatedContainer>
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
