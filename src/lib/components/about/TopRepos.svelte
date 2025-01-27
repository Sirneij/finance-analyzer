<script lang="ts">
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import GitFork from '$lib/components/icons/GitFork.svelte';
	import GitStar from '$lib/components/icons/GitStar.svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Repo from '$lib/components/icons/Repo.svelte';

	interface TopReposSectionProps extends HTMLAttributes<HTMLElement> {
		topRepos: Array<{
			name: string;
			description: string | null;
			stargazers_count: number;
			forks_count: number;
			language: string | null;
			html_url: string;
		}>;
	}

	let { topRepos, ...props }: TopReposSectionProps = $props();
</script>

<AnimatedSection class="space-y-12" y={50} delay={300} {...props}>
	<div class="mb-8 flex items-center gap-3">
		<Repo class="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
		<h2 class="text-3xl font-semibold">Featured Repositories</h2>
	</div>

	<div class="relative w-full">
		<!-- Scroll container -->
		<div class="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pl-4">
			{#each topRepos as repo}
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

<style>
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
