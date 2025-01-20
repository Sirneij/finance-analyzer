<script lang="ts">
	import Search from '$lib/components/icons/Search.svelte';
	import type { PageData } from './$types';
	import ThemeSwitcher from '$lib/components/resuables/ThemeSwitcher.svelte';
	import AiNode from '$lib/components/icons/AINode.svelte';
	import FinChart from '$lib/components/icons/FinChart.svelte';
	import Calculator from '$lib/components/icons/Calculator.svelte';
	import AnimatedContainer from '$lib/components/animations/AnimatedContainer.svelte';
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';

	let { data } = $props<{ data: PageData }>();
	let searchQuery = $state('');
</script>

<div
	class="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
>
	<!-- Theme Toggle -->
	<ThemeSwitcher
		class="absolute right-4 top-4 z-50 cursor-pointer rounded-full bg-white p-2 shadow-md hover:shadow-lg dark:bg-gray-800"
	/>

	<!-- Decorative Icons -->
	<div class="absolute inset-0 z-0 overflow-hidden">
		<div class="floating-icons absolute left-10 top-10 opacity-10 dark:opacity-20">
			<AiNode />
		</div>
		<div class="floating-icons absolute bottom-32 right-20 opacity-10 dark:opacity-20">
			<FinChart />
		</div>
		<div class="floating-icons absolute right-10 top-20 opacity-10 dark:opacity-20">
			<Calculator />
		</div>
	</div>

	<AnimatedContainer class="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
		<!-- Hero Section -->
		<AnimatedSection y={20} class="py-16 text-center">
			<h1
				class="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl"
			>
				API Documentation
			</h1>
			<p class="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
				Explore our API endpoints, learn how to integrate, and build amazing applications.
			</p>

			<!-- Search -->
			<div class="mx-auto mt-12 max-w-xl">
				<div class="group relative">
					<Search
						class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indigo-500"
					/>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search endpoints..."
						class="w-full rounded-lg border border-gray-200 bg-white py-3 pl-12 pr-4 text-gray-900 shadow-sm transition-shadow hover:shadow-md focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
					/>
				</div>
			</div>
		</AnimatedSection>

		<!-- Categories -->
		<AnimatedSection y={30} delay={200} class="mb-16">
			<h2 class="mb-8 text-3xl font-bold text-gray-900 dark:text-white">API Categories</h2>
			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.categories as category}
					<a
						href="/finanalyzer/docs/category/{category}"
						class="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
					>
						<h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">{category}</h3>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							{data.docs.filter((doc: { category: any }) => doc.category === category).length} endpoints
						</p>
					</a>
				{/each}
			</div>
		</AnimatedSection>

		<!-- Popular Endpoints -->
		<AnimatedSection y={40} delay={400} class="mb-20 backdrop-blur-sm">
			<h2 class="mb-8 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
				Popular Endpoints
			</h2>
			<div class="space-y-4">
				{#each data.popularEndpoints as endpoint}
					<a
						href="/finanalyzer/docs/{endpoint._id}"
						class="group block overflow-hidden rounded-2xl border border-gray-200/50 bg-white/50 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-gray-700/50 dark:bg-gray-800/50"
					>
						<div class="flex items-center justify-between">
							<div>
								<div class="font-mono text-sm font-medium text-gray-900 dark:text-white">
									{endpoint.path}
								</div>
								<div class="mt-1 text-sm text-gray-600 dark:text-gray-400">
									{endpoint.category}
								</div>
							</div>
							<span
								class="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-1 text-xs font-medium text-white shadow-lg"
							>
								{endpoint.method}
							</span>
						</div>
					</a>
				{/each}
			</div>
		</AnimatedSection>

		<!-- Getting Started -->
		<AnimatedSection y={50} delay={600} class="mb-20 backdrop-blur-sm">
			<h2 class="mb-8 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
				Getting Started
			</h2>
			<div class="space-y-6">
				<!-- Documentation Cards -->
				<div
					class="rounded-2xl border border-gray-200/50 bg-white/50 p-6 backdrop-blur-sm transition-all hover:shadow-lg dark:border-gray-700/50 dark:bg-gray-800/50"
				>
					<p class="text-gray-600 dark:text-gray-300">
						Our API uses REST architecture and returns responses in JSON format. All API requests
						must be made over HTTPS and authenticated using your API key.
					</p>
				</div>

				<div
					class="rounded-2xl border border-gray-200/50 bg-white/50 p-6 backdrop-blur-sm transition-all hover:shadow-lg dark:border-gray-700/50 dark:bg-gray-800/50"
				>
					<h3 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Base URL</h3>
					<pre
						class="overflow-x-auto rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-4 font-mono text-sm text-white shadow-lg dark:from-black dark:to-gray-900">https://api.example.com/v1</pre>
				</div>

				<div
					class="rounded-2xl border border-gray-200/50 bg-white/50 p-6 backdrop-blur-sm transition-all hover:shadow-lg dark:border-gray-700/50 dark:bg-gray-800/50"
				>
					<h3 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Authentication</h3>
					<p class="mb-4 text-gray-600 dark:text-gray-300">
						Include your API key in the Authorization header:
					</p>
					<pre
						class="overflow-x-auto rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-4 font-mono text-sm text-white shadow-lg dark:from-black dark:to-gray-900">Authorization: Bearer YOUR_API_KEY</pre>
				</div>
			</div>
		</AnimatedSection>
	</AnimatedContainer>
</div>

<style>
	.floating-icons {
		animation: float 6s ease-in-out infinite;
	}
	.floating-icons:nth-child(2) {
		animation-delay: 2s;
	}
	.floating-icons:nth-child(3) {
		animation-delay: 4s;
	}
	@keyframes float {
		0% {
			transform: translateY(0px) rotate(0deg);
		}
		50% {
			transform: translateY(-20px) rotate(360deg);
		}
		100% {
			transform: translateY(0px) rotate(0deg);
		}
	}
</style>
