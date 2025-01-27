<script lang="ts">
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import type { ProcessedDevToArticles } from '$lib/types/dev.to.types';
	import type { BasicUserData } from '$lib/types/github.types';
	import {
		calculateTotalComments,
		calculateTotalReactions,
		fetchFollowers
	} from '$lib/utils/helpers/dev.to.helpers';
	import { formatRange } from '$lib/utils/helpers/docs.helpers';
	import { onMount } from 'svelte';
	import { icons } from '../icons';

	let {
		githubUser,
		devtoArticles = $bindable()
	}: { githubUser: BasicUserData; devtoArticles: ProcessedDevToArticles | null } = $props();

	const githubStats = [
		{
			label: 'Public Repos',
			value: formatRange(githubUser.public_repos),
			iconName: 'repo'
		},
		{
			label: 'Followers',
			value: formatRange(githubUser.followers),
			iconName: 'followers'
		},
		{
			label: 'Following',
			value: formatRange(githubUser.following),
			iconName: 'followers'
		},
		{
			label: 'Location',
			value: githubUser.location,
			iconName: 'location'
		}
	];
	let devToStats = $state([] as { label: string; value: string; iconName: string }[]),
		totalArticles = $state(0),
		totalReactions = $state(0),
		totalComments = $state(0);

	$effect(() => {
		totalArticles = devtoArticles
			? Object.values(devtoArticles.series).flat().length + devtoArticles.standalone.length
			: 0;

		totalReactions = devtoArticles ? calculateTotalReactions(devtoArticles) : 0;
		totalComments = devtoArticles ? calculateTotalComments(devtoArticles) : 0;

		onMount(async () => {
			const devtoFollowers = await fetchFollowers();
			devToStats = [
				{
					label: 'Articles',
					value: formatRange(totalArticles),
					iconName: 'articles'
				},
				{
					label: 'Followers',
					value: formatRange(devtoFollowers.count),
					iconName: 'followers'
				},
				{
					label: 'Total Reactions',
					value: formatRange(totalReactions),
					iconName: 'reactions'
				},
				{
					label: 'Comments',
					value: formatRange(totalComments),
					iconName: 'comments'
				}
			];
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
				{@const Icon = icons[stat.iconName as keyof typeof icons]}
				<div
					class="group relative rounded-xl bg-gradient-to-br from-indigo-500/30 to-teal-500/30 p-[1px] transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-110 hover:shadow-xl hover:shadow-indigo-500/20"
				>
					<div class="relative h-full rounded-xl bg-gray-100 p-6 text-center dark:bg-gray-800/50">
						<div
							class="absolute -top-4 left-1/2 -translate-x-1/2 transform rounded-full bg-gradient-to-r from-indigo-600 to-teal-600 p-3 text-white shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:rotate-12 group-hover:shadow-xl dark:from-indigo-400 dark:to-teal-400"
						>
							<Icon class="h-6 w-6 text-white" stroke="#fff" />
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
				{@const Icon = icons[stat.iconName as keyof typeof icons]}
				<div
					class="group relative rounded-xl bg-gradient-to-br from-indigo-500/30 to-teal-500/30 p-[1px] transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-110 hover:shadow-xl hover:shadow-indigo-500/20"
				>
					<div class="relative h-full rounded-xl bg-gray-100 p-6 text-center dark:bg-gray-800/50">
						<div
							class="absolute -top-4 left-1/2 -translate-x-1/2 transform rounded-full bg-gradient-to-r from-indigo-600 to-teal-600 p-3 text-white shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:rotate-12 group-hover:shadow-xl dark:from-indigo-400 dark:to-teal-400"
						>
							<Icon class="h-6 w-6 text-white" stroke="#fff" />
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
				{#each new Array(4) as _}
					<div class="animate-pulse bg-gray-100 dark:bg-gray-800/50 rounded-xl p-6 text-center">
						<div class="h-12 w-12 bg-gray-200 dark:bg-gray-700/50 rounded-full mx-auto mb-4"></div>
						<div class="h-4 w-24 bg-gray-200 dark:bg-gray-700/50 rounded mx-auto"></div>
					</div>
				{/each}
			{/each}
		</div>
	</div>
</AnimatedSection>
