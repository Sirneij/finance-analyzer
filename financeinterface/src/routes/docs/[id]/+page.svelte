<script lang="ts">
	import { marked } from 'marked';
	import Side from '$lib/components/docs/Side.svelte';
	import type { PageData } from '../$types';
	import CodeSnippets from '$lib/components/docs/CodeSnippets.svelte';
	import ThemeSwitcher from '$lib/components/resuables/ThemeSwitcher.svelte';
	import { fly } from 'svelte/transition';
	import hljs from 'highlight.js';
	import 'highlight.js/styles/night-owl.min.css';
	import type { CodeExample } from '$lib/types/docs.types';
	import { LANGUAGES_MAP } from '$lib/utils/contants';
	import AnimatedContainer from '$lib/components/animations/AnimatedContainer.svelte';
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';

	let { data } = $props<{ data: PageData }>();
	let isSidebarOpen = $state(false),
		isCollapsed = $state(false),
		currentExample = $state<CodeExample>(data.currentDoc.examples[0]),
		codeSnippetContainer = $state<HTMLDivElement>();

	// Handle mobile responsiveness
	let isMobile = $state(false);

	$effect(() => {
		hljs.highlightAll();
		// Check screen size on mount and resize
		const checkMobile = () => {
			isMobile = window.innerWidth < 1024;
			if (isMobile) {
				isCollapsed = true;
				isSidebarOpen = false;
			}
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);
		window.scrollTo(0, 0);

		return () => window.removeEventListener('resize', checkMobile);
	});

	$effect(() => {
		if (currentExample && codeSnippetContainer) {
			requestAnimationFrame(() => {
				const codeBlock = codeSnippetContainer?.querySelector('pre code');
				if (codeBlock instanceof HTMLElement) {
					try {
						// Clean up previous highlighting
						delete codeBlock.dataset.highlighted;

						// Set the code content
						codeBlock.innerHTML = currentExample.code.trim();
						// Set the correct language class
						const language = LANGUAGES_MAP[currentExample.language].hljsLanguage;
						codeBlock.className = `language-${language}`;
						// Apply new highlighting
						hljs.highlightElement(codeBlock);
					} catch (error) {
						console.error('Error applying syntax highlighting:', error);
					}
				}
			});
		}
	});
</script>

<div class="relative min-h-screen bg-white dark:bg-gray-900">
	<ThemeSwitcher
		class="fixed right-4 top-4 z-50 cursor-pointer rounded-full bg-white p-2 shadow-sm hover:shadow-md dark:bg-gray-800"
	/>

	<!-- Mobile Menu Button -->
	{#if isMobile}
		<button
			class="fixed left-4 top-4 z-50 rounded-lg bg-white p-2 shadow-sm dark:bg-gray-800"
			onclick={() => (isSidebarOpen = !isSidebarOpen)}
			aria-label="Toggle menu"
		>
			<svg class="h-6 w-6 text-gray-600 dark:text-gray-300" viewBox="0 0 24 24" fill="none">
				<path
					stroke="currentColor"
					stroke-width="2"
					d={isSidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
				/>
			</svg>
		</button>
	{/if}

	<div class="grid">
		<Side
			docs={data.docs}
			activeDoc={data.currentDoc}
			bind:isCollapsed
			className={`fixed inset-y-0 left-0 z-40 transform bg-white transition-all duration-300 dark:bg-gray-900 lg:translate-x-0 ${
				isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
			}`}
		/>

		<main
			class="transition-all duration-300 {!isMobile && !isCollapsed
				? 'lg:ml-64'
				: 'lg:ml-20'} mt-16 flex-1 px-4 py-4 lg:mt-0 lg:px-8 lg:py-12"
			in:fly={{ x: 20, duration: 600 }}
		>
			<AnimatedContainer class="mx-auto max-w-7xl">
				<div
					class="grid gap-8 {data.currentDoc.examples.length ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}"
				>
					<div class="space-y-8">
						<AnimatedSection y={20}>
							<h1 class="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl dark:text-white">
								{data.currentDoc.path}
							</h1>
							<div class="mt-4 flex flex-wrap items-center gap-2">
								<span
									class="rounded border border-indigo-200 bg-blue-50 px-4 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300"
								>
									{data.currentDoc.method}
								</span>
								<span class="text-sm text-gray-600 dark:text-gray-400">
									{data.currentDoc.category}
								</span>
							</div>
						</AnimatedSection>

						<AnimatedSection
							y={30}
							delay={200}
							class="prose prose-blue dark:prose-invert max-w-none"
						>
							{@html marked(data.currentDoc.description)}
						</AnimatedSection>

						{#if data.currentDoc.responses.length}
							<AnimatedSection y={40} delay={400} class="space-y-4">
								<h2 class="text-2xl font-semibold text-gray-900 dark:text-white">Responses</h2>
								{#each data.currentDoc.responses as response}
									<div
										class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md sm:p-6 dark:border-gray-700 dark:bg-gray-800"
									>
										<div class="mb-4 flex flex-wrap items-center gap-2">
											<span
												class="rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-1 text-xs font-medium text-white shadow-sm"
											>
												{response.status}
											</span>
											<span class="text-sm text-gray-600 dark:text-gray-400">
												{@html marked(response.description)}
											</span>
										</div>
										<div class="prose prose-blue dark:prose-invert max-w-none">
											{@html marked(response.example)}
										</div>
									</div>
								{/each}
							</AnimatedSection>
						{/if}
					</div>

					{#if data.currentDoc.examples.length}
						<!-- Code Snippets -->
						<AnimatedSection y={50} delay={600}>
							<div class="lg:sticky lg:top-20" bind:this={codeSnippetContainer}>
								<CodeSnippets examples={data.currentDoc.examples} bind:currentExample />
							</div>
						</AnimatedSection>
					{/if}
				</div>
			</AnimatedContainer>
		</main>
	</div>

	<!-- Mobile Overlay -->
	{#if isMobile && isSidebarOpen}
		<button
			class="fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm"
			onclick={() => (isSidebarOpen = false)}
			aria-label="Close menu"
		></button>
	{/if}
</div>
