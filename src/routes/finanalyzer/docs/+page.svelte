<script lang="ts">
	import Search from '$lib/components/icons/Search.svelte';
	import type { PageData } from './$types';
	import ThemeSwitcher from '$lib/components/reusables/ThemeSwitcher.svelte';
	import AiNode from '$lib/components/icons/AINode.svelte';
	import FinChart from '$lib/components/icons/FinChart.svelte';
	import Calculator from '$lib/components/icons/Calculator.svelte';
	import AnimatedContainer from '$lib/components/animations/AnimatedContainer.svelte';
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import hljs from 'highlight.js';
	import { marked } from '$lib/utils/helpers/docs.helpers';
	import type { ApiDoc } from '$lib/types/docs.types';
	import { sampleAuth, sampleBaseURL } from '$lib/utils/helpers/docs.helpers';
	import MethodBadge from '$lib/components/docs/MethodBadge.svelte';
	import { flip } from 'svelte/animate';
	import { fade, slide } from 'svelte/transition';
	import Endpoints from '$lib/components/docs/documentation/Endpoints.svelte';
	import { SLIDE_DURATION } from '$lib/utils/helpers/misc.transitions';
	import Breadcrumbs from '$lib/components/reusables/Breadcrumbs.svelte';
	import { WEBSITE_URL } from '$lib/utils/contants';
	import { onMount } from 'svelte';

	let { data } = $props<{ data: PageData }>();

	let searchQuery = $state(''),
		gettingStartedContainer = $state<HTMLDivElement>();

	$effect(() => {
		if (gettingStartedContainer) {
			hljs.highlightAll();
		}
	});

	const suggestions: ApiDoc[] = $derived(
		data.docs.filter((doc: ApiDoc) => {
			const combined = (doc.path + doc.method + doc.description).toLowerCase();
			return combined.includes(searchQuery.toLowerCase());
		})
	);

	const categoryDocMappings = (data.docs as ApiDoc[])
		.reduce((map, doc) => {
			if (!map.has(doc.category)) {
				map.set(doc.category, { category: doc.category, docId: doc._id });
			}
			return map;
		}, new Map())
		.values();

	const crumbs = [{ text: 'Documentation', href: '/finanalyzer/docs' }];

	function getJsonLd() {
		return {
			'@context': 'https://schema.org',
			'@type': 'WebPage',
			name: 'API Documentation | Finanalyzer',
			description:
				'Explore our API endpoints, learn how to integrate, and build amazing applications',
			url: `${WEBSITE_URL}/finanalyzer/docs`,
			publisher: {
				'@type': 'Organization',
				name: 'Finanalyzer',
				url: `${WEBSITE_URL}`,
				logo: `${WEBSITE_URL}/logo.svg`
			},
			author: {
				'@type': 'Person',
				name: 'John Owolabi Idogun',
				url: `${WEBSITE_URL}`,
				sameAs: ['https://twitter.com/sirneij']
			}
		};
	}

	onMount(() => {
		const script = document.createElement('script');
		script.type = 'application/ld+json';
		script.textContent = JSON.stringify(getJsonLd());
		document.head.appendChild(script);

		return () => {
			document.head.removeChild(script);
		};
	});
</script>

<svelte:head>
	<title>API Documentation | Finanalyzer</title>
	<meta
		name="description"
		content="Explore our API endpoints, learn how to integrate, and build amazing applications"
	/>
	<meta name="keywords" content="api docs, documentation, endpoints" />
	<meta name="robots" content="index, follow" />
	<meta name="author" content="John Owolabi Idogun" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:site" content="@sirneij" />
	<meta name="twitter:creator" content="@sirneij" />
	<meta property="og:url" content="{WEBSITE_URL}/finanalyzer/docs" />
	<meta property="og:title" content="API Documentation | Finanalyzer" />
	<meta
		property="og:description"
		content="Explore our API endpoints, learn how to integrate, and build amazing applications"
	/>
	<meta property="og:image" content="{WEBSITE_URL}/logo.svg" />
	<meta property="og:image:alt" content="Finanalyzer Logo" />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Finanalyzer" />
	<meta property="og:locale" content="en_US" />
	<meta property="og:locale:alternate" content="en_GB" />

	<link rel="canonical" href="{WEBSITE_URL}/finanalyzer/docs" />
	<link rel="alternate" hreflang="en" href="{WEBSITE_URL}/finanalyzer/docs" />
</svelte:head>

<div
	class="relative min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
>
	<Breadcrumbs {crumbs} />
	<!-- Theme Toggle -->
	<ThemeSwitcher
		class="absolute top-4 right-4 z-50 cursor-pointer rounded-full bg-white p-2 shadow-md hover:shadow-lg dark:bg-gray-800"
	/>

	<!-- Decorative Icons -->
	<div class="absolute inset-0 z-0 overflow-hidden">
		<div class="floating-icons absolute top-10 left-10 opacity-10 dark:opacity-20">
			<AiNode />
		</div>
		<div class="floating-icons absolute right-20 bottom-32 opacity-10 dark:opacity-20">
			<FinChart />
		</div>
		<div class="floating-icons absolute top-20 right-10 opacity-10 dark:opacity-20">
			<Calculator />
		</div>
	</div>

	<AnimatedContainer class="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
		<!-- Hero Section -->
		<AnimatedSection y={20} class="py-16 text-center">
			<h1
				class="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl"
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
						class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indigo-500"
					/>
					<input
						type="search"
						bind:value={searchQuery}
						placeholder="Search endpoints..."
						class="w-full rounded-lg border border-gray-200 bg-white py-3 pr-4 pl-12 text-gray-900 shadow-xs transition-shadow hover:shadow-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
					/>

					{#if searchQuery.length >= 2}
						<div
							class="absolute z-10 w-full rounded-lg border bg-white shadow-md dark:bg-gray-800"
							transition:slide={{ duration: SLIDE_DURATION }}
						>
							{#if suggestions.length === 0}
								<div class="p-4 text-gray-600 dark:text-gray-400">No results found</div>
							{:else}
								<Endpoints endpoints={suggestions} isOpen={true} handleEndpointSelect={null} />
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</AnimatedSection>

		<!-- Categories -->
		<AnimatedSection y={30} delay={200} class="mb-16">
			<h2 class="mb-8 text-3xl font-bold text-gray-900 dark:text-white">API Categories</h2>
			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{#each categoryDocMappings as categoryDocMapping}
					<a
						href="/finanalyzer/docs/{categoryDocMapping.docId}#{categoryDocMapping.category}"
						class="group rounded-lg border border-gray-200 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
					>
						<h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
							{categoryDocMapping.category}
						</h3>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							{data.docs.filter(
								(doc: { category: string }) => doc.category === categoryDocMapping.category
							).length} endpoints
						</p>
					</a>
				{/each}
			</div>
		</AnimatedSection>

		<!-- Popular Endpoints -->
		<AnimatedSection y={40} delay={400} class="mb-20 backdrop-blur-xs">
			<h2 class="mb-8 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
				Popular Endpoints
			</h2>
			<div class="flex flex-row flex-wrap gap-4">
				{#each data.popularEndpoints as endpoint (endpoint._id)}
					<a
						href="/finanalyzer/docs/{endpoint._id}"
						animate:flip={{ duration: 300 }}
						in:fade|local={{ duration: 300 }}
						out:slide|local={{ duration: 300 }}
						class="group relative w-full rounded-lg border border-gray-200 bg-white p-6 shadow-xs transition-all hover:shadow-md sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] dark:border-gray-700 dark:bg-gray-800"
					>
						<div class="flex items-center justify-between">
							<MethodBadge method={endpoint.method} />
							<span class="text-sm font-medium text-gray-500 dark:text-gray-400">
								{endpoint.category}
							</span>
						</div>
						<p class="mt-4 text-left font-mono text-sm text-gray-900 dark:text-white">
							{endpoint.path}
						</p>
					</a>
				{/each}
			</div>
		</AnimatedSection>

		<!-- Getting Started -->
		<AnimatedSection y={50} delay={600} class="mb-20 backdrop-blur-xs">
			<h2 class="mb-8 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
				Getting Started
			</h2>
			<div class="space-y-6" bind:this={gettingStartedContainer}>
				<!-- Documentation Cards -->
				<div
					class="rounded-2xl border border-gray-200/50 bg-white/50 p-6 backdrop-blur-xs transition-all hover:shadow-lg dark:border-gray-700/50 dark:bg-gray-800/50"
				>
					<p class="text-gray-600 dark:text-gray-300">
						Our API uses REST architecture and returns responses in JSON format. All API requests
						must be made over HTTPS and authenticated by including your cookies in the request
						headers. This means you must be logged in to access the API and on only the server-side
						of your frontend applications.
					</p>
				</div>

				<div
					class="rounded-2xl border border-gray-200/50 bg-white/50 p-6 backdrop-blur-xs transition-all hover:shadow-lg dark:border-gray-700/50 dark:bg-gray-800/50"
				>
					<h3 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Base URL</h3>
					{@html marked(sampleBaseURL)}
				</div>

				<div
					class="rounded-2xl border border-gray-200/50 bg-white/50 p-6 backdrop-blur-xs transition-all hover:shadow-lg dark:border-gray-700/50 dark:bg-gray-800/50"
				>
					<h3 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Authentication</h3>
					<p class="mb-4 text-gray-600 dark:text-gray-300">
						Include your session cookies in the request headers:
					</p>
					{@html marked(sampleAuth)}
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
