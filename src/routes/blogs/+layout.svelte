<script lang="ts">
	import ThemeSwitcher from '$lib/components/reusables/ThemeSwitcher.svelte';
	import JI from '$lib/components/logos/JI.svelte';
	import Footer from '$lib/components/about/Footer.svelte';
	import { WEBSITE_URL } from '$lib/utils/contants.js';
	import { onMount } from 'svelte';

	let { children } = $props();

	function getJsonLd() {
		return {
			'@context': 'https://schema.org',
			'@type': 'Blog',
			name: "John Owolabi Idogun's Tech Blog",
			url: `${WEBSITE_URL}/blogs`,
			description:
				'In-depth articles about software engineering, web development, and tech tutorials',
			author: {
				'@type': 'Person',
				name: 'John Owolabi Idogun',
				url: `${WEBSITE_URL}`,
				sameAs: [
					'https://twitter.com/sirneij',
					'https://github.com/sirneij',
					'https://www.linkedin.com/in/john-owolabi-idogun/',
					'https://dev.to/sirneij/'
				]
			},
			publisher: {
				'@type': 'Organization',
				name: 'John Owolabi Idogun',
				logo: {
					'@type': 'ImageObject',
					url: `${WEBSITE_URL}/logo.png`
				}
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
	<title>Technical Articles & Software Engineering Blog | John Owolabi Idogun</title>
	<meta
		name="description"
		content="Explore in-depth articles about software engineering, web development, JavaScript, TypeScript, Python, and tech tutorials. Written by John Owolabi Idogun."
	/>
	<meta
		name="keywords"
		content="Software Engineering, Web Development, JavaScript, TypeScript, Python, React, Svelte, NodeJS, Backend Development, Frontend Development, Tech Tutorials, Programming Tips"
	/>
	<meta name="author" content="John Owolabi Idogun" />
	<link rel="canonical" href="{WEBSITE_URL}/blogs" />

	<!-- OpenGraph Meta -->
	<meta property="og:type" content="website" />
	<meta
		property="og:title"
		content="Technical Articles & Software Engineering Blog | John Owolabi Idogun"
	/>
	<meta
		property="og:description"
		content="Explore in-depth articles about software engineering, web development, JavaScript, TypeScript, Python, and tech tutorials."
	/>
	<meta property="og:url" content="{WEBSITE_URL}/blogs" />
	<meta property="og:site_name" content="John Owolabi Idogun" />
	<meta property="og:image" content={`${WEBSITE_URL}/JI.png`} />

	<!-- Twitter Meta -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@sirneij" />
	<meta name="twitter:creator" content="@sirneij" />
	<meta name="twitter:title" content="Technical Articles & Software Engineering Blog" />
	<meta
		name="twitter:description"
		content="Explore in-depth articles about software engineering, web development, JavaScript, TypeScript, Python, and tech tutorials."
	/>
	<meta name="twitter:image" content={`${WEBSITE_URL}/JI.png`} />
</svelte:head>

<div class="relative min-h-screen bg-white dark:bg-gray-900" id="main-content">
	<!-- Logo -->
	<div class="fixed left-4 top-4 z-50">
		<a href="/" class="cursor-pointer" aria-label="Home">
			<JI
				size={40}
				class="text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
			/>
		</a>
	</div>

	<ThemeSwitcher
		class="fixed right-4 top-4 z-50 cursor-pointer rounded-full bg-white p-2 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-700 dark:ring-2"
	/>

	{@render children()}

	<Footer />
</div>
