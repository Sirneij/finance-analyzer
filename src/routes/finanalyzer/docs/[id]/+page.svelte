<script lang="ts">
	import Side from '$lib/components/docs/Side.svelte';
	import type { PageData } from '../$types';
	import CodeSnippets from '$lib/components/docs/CodeSnippets.svelte';
	import ThemeSwitcher from '$lib/components/reusables/ThemeSwitcher.svelte';
	import { fly } from 'svelte/transition';
	import type { CodeExample } from '$lib/types/docs.types';
	import { LANGUAGES_MAP } from '$lib/utils/contants';
	import AnimatedContainer from '$lib/components/animations/AnimatedContainer.svelte';
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import hljs from 'highlight.js';
	import Search from '$lib/components/docs/Search.svelte';
	import Description from '$lib/components/docs/Description.svelte';

	let { data } = $props<{ data: PageData }>();
	let isSidebarOpen = $state(false),
		isCollapsed = $state(false),
		currentExample = $state<CodeExample>(data.currentDoc.examples[0]),
		codeSnippetContainer = $state<HTMLDivElement>(),
		// Handle mobile responsiveness
		isMobile = $state(false),
		innerWidth = $state(0);

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

	// Check screen size on mount and resize
	const checkMobile = () => {
		isMobile = innerWidth < 1024;
		if (isMobile) {
			isCollapsed = true;
			isSidebarOpen = false;
		}
	};
</script>

<svelte:window on:resize={checkMobile} bind:innerWidth />

<div class="relative min-h-screen bg-white dark:bg-gray-900">
	<Search docs={data.docs} />
	<ThemeSwitcher
		class="fixed right-4 top-4 z-50 cursor-pointer rounded-full bg-white p-2 shadow-sm hover:shadow-md dark:bg-gray-800 xs:left-[16.5rem] xs:right-auto"
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
					<!-- Description -->
					<Description currentDoc={data.currentDoc} />

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
