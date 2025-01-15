<script lang="ts">
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import type { ProcessedDevToArticles } from '$lib/types/dev.to.types';
	import type { BasicUserData } from '$lib/types/github.types';
	import {
		calculateTotalComments,
		calculateTotalReactions,
		fetchFollowers
	} from '$lib/utils/helpers/dev.to.helpers';

	let {
		githubUser,
		devtoArticles
	}: { githubUser: BasicUserData; devtoArticles: ProcessedDevToArticles | null } = $props();

	const githubStats = [
		{
			label: 'Public Repos',
			value: githubUser.public_repos.toLocaleString(),
			icon: 'M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z'
		},
		{
			label: 'Followers',
			value: githubUser.followers.toLocaleString(),
			icon: 'M2 5.5a3.5 3.5 0 115.898 2.549 5.507 5.507 0 013.034 4.084.75.75 0 11-1.482.235 4.001 4.001 0 00-7.9 0 .75.75 0 01-1.482-.236A5.507 5.507 0 013.102 8.05 3.49 3.49 0 012 5.5zM11 4a3.001 3.001 0 012.22 5.018 5.01 5.01 0 012.56 3.012.749.749 0 01-.885.954.752.752 0 01-.549-.514 3.507 3.507 0 00-2.522-2.372.75.75 0 01-.574-.73v-.352a.75.75 0 01.416-.672A1.5 1.5 0 0011 5.5.75.75 0 0111 4zm-5.5-.5a2 2 0 10-.001 3.999A2 2 0 005.5 3.5z'
		},
		{
			label: 'Following',
			value: githubUser.following.toLocaleString(),
			icon: 'M10.5 5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm.061 3.073a4 4 0 00-5.123 0 .75.75 0 00.284 1.105l.31.155A3.29 3.29 0 018 9.875c.702 0 1.372-.109 2.033-.542l.31-.155a.75.75 0 00.284-1.105 4 4 0 00-1.592-.925zm0 0'
		},
		{
			label: 'Location',
			value: githubUser.location,
			icon: 'M6 0C2.687 0 0 2.687 0 6c0 4.5 6 10 6 10s6-5.5 6-10c0-3.313-2.687-6-6-6zm0 8.3a2.3 2.3 0 110-4.6 2.3 2.3 0 010 4.6z'
		}
	];
	const totalArticles = devtoArticles
		? Object.values(devtoArticles.series).flat().length + devtoArticles.standalone.length
		: 0;

	const totalReactions = devtoArticles ? calculateTotalReactions(devtoArticles) : 0;
	const totalComments = devtoArticles ? calculateTotalComments(devtoArticles) : 0;

	let devToStats = $state([] as { label: string; value: string; icon: string }[]);

	$effect(() => {
		fetchFollowers()
			.then((followers) => {
				if (followers) {
					devToStats = [
						{
							label: 'Articles',
							value: totalArticles.toLocaleString(),
							icon: 'M19.708 2H4.292C3.028 2 2 3.028 2 4.292v15.416C2 20.972 3.028 22 4.292 22h15.416C20.972 22 22 20.972 22 19.708V4.292C22 3.028 20.972 2 19.708 2zm.792 17.708c0 .437-.355.792-.792.792H4.292c-.437 0-.792-.355-.792-.792V4.292c0-.437.355-.792.792-.792h15.416c.437 0 .792.355.792.792v15.416z'
						},
						{
							label: 'Followers',
							value: followers.count.toLocaleString(),
							icon: 'M2 5.5a3.5 3.5 0 115.898 2.549 5.507 5.507 0 013.034 4.084.75.75 0 11-1.482.235 4.001 4.001 0 00-7.9 0 .75.75 0 01-1.482-.236A5.507 5.507 0 013.102 8.05 3.49 3.49 0 012 5.5z'
						},
						{
							label: 'Total Reactions',
							value: totalReactions.toLocaleString(),
							icon: 'M8.864 15.674c-.956.24-1.843-.484-1.908-1.42-.072-1.05-.23-2.015-.428-2.59-.125-.36-.479-1.012-1.04-1.638-.557-.624-1.282-1.179-2.131-1.41C2.685 8.432 2 7.85 2 7V3c0-.845.682-1.464 1.448-1.546 1.07-.113 1.564-.415 2.068-.723l.048-.029c.272-.166.578-.349.97-.484C6.931.08 7.395 0 8 0h3.5c.937 0 1.599.478 1.934.88.164.198.432.287.682.287.53 0 .96.43.96.96v1.996c-.001.498-.2.962-.547 1.3-.185.183-.466.275-.748.275a.75.75 0 00-.75.75c0 .202-.24.412-.673.55-.97.31-1.733.812-2.367 1.448-.635.636-1.137 1.398-1.45 2.368-.139.435-.35.675-.552.675a.75.75 0 00-.75.75c0 .282-.092.563-.275.748a1.684 1.684 0 01-1.3.547c-.5 0-.96-.2-1.3-.547z'
						},
						{
							label: 'Comments',
							value: totalComments.toLocaleString(),
							icon: 'M1.75 1h12.5c.966 0 1.75.784 1.75 1.75v9.5A1.75 1.75 0 0114.25 14H8.061l-2.574 2.573A1.458 1.458 0 013 15.543V14H1.75A1.75 1.75 0 010 12.25v-9.5C0 1.784.784 1 1.75 1zM1.5 2.75v9.5c0 .138.112.25.25.25h2a.75.75 0 01.75.75v2.19l2.72-2.72a.749.749 0 01.53-.22h6.5a.25.25 0 00.25-.25v-9.5a.25.25 0 00-.25-.25H1.75a.25.25 0 00-.25.25z'
						}
					];
				}
			})
			.catch((e) => {
				console.error(e);
			});
	});
</script>

<AnimatedSection class="space-y-12" y={50} delay={200}>
	<h2 class="mb-8 text-3xl font-semibold">Platform Overview</h2>

	<!-- GitHub Stats -->
	<div>
		<h3 class="mb-6 text-2xl font-semibold">GitHub</h3>
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
	</div>
	<!-- Dev.to Stats -->
	<div>
		<h3 class="mb-6 text-2xl font-semibold">Dev.to</h3>
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each devToStats as stat}
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
			{:else}
				<div class="animate-pulse bg-gray-100 dark:bg-gray-800/50 rounded-xl p-6 text-center">
					<div class="h-12 w-12 bg-gray-200 dark:bg-gray-700/50 rounded-full mx-auto mb-4"></div>
					<div class="h-4 w-24 bg-gray-200 dark:bg-gray-700/50 rounded mx-auto"></div>
				</div>
			{/each}
		</div>
	</div>
</AnimatedSection>
