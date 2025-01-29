<script lang="ts">
	import type { IArticlePopulated } from '$lib/types/articles.types';
	import { onMount } from 'svelte';

	let { article }: { article: IArticlePopulated } = $props();

	function getJsonLd(article: IArticlePopulated) {
		return {
			'@context': 'https://schema.org',
			'@type': 'Article',
			headline: article.title,
			author: {
				'@type': 'Person',
				name: 'John Owolabi Idogun'
			},
			publisher: {
				'@type': 'Organization',
				name: 'John Owolabi Idogun',
				logo: {
					'@type': 'ImageObject',
					url: 'https://johnowolabiidogun.dev/logo.png'
				}
			},
			datePublished: article.createdAt,
			dateModified: article.updatedAt,
			mainEntityOfPage: {
				'@type': 'WebPage',
				'@id': `https://johnowolabiidogun.dev/blogs/${article.slug}/${article._id}`
			},
			image: article.foreImage,
			keywords: article.tags.map((tag) => tag.name).join(', '),
			description: article.content.slice(0, 160)
		};
	}

	onMount(() => {
		const script = document.createElement('script');
		script.type = 'application/ld+json';
		script.textContent = JSON.stringify(getJsonLd(article));
		document.head.appendChild(script);

		return () => {
			document.head.removeChild(script);
		};
	});
</script>

<svelte:head>
	<!-- SEO Meta -->
	<title>{article.title} | John Owolabi Idogun</title>
	<meta name="description" content={article.content.slice(0, 160)} />
	<link rel="canonical" href="https://johnowolabiidogun.dev/blogs/{article.slug}/{article._id}" />

	<!-- Open Graph Meta -->
	<meta property="og:type" content="article" />
	<meta property="og:title" content={article.title} />
	<meta property="og:description" content={article.content.slice(0, 160)} />
	<meta
		property="og:url"
		content="https://johnowolabiidogun.dev/blogs/{article.slug}/{article._id}"
	/>
	<meta property="og:site_name" content="John Owolabi Idogun" />
	<meta property="og:locale" content="en_US" />
	<meta property="og:image" content={article.foreImage} />
	<meta property="og:image:alt" content={article.title} />
	<meta property="article:published_time" content={article.createdAt} />
	<meta property="article:modified_time" content={article.updatedAt} />
	<meta property="article:author" content="John Owolabi Idogun" />
	<meta property="article:tag" content={article.tags.map((tag) => tag.name).join(', ')} />

	<!-- Twitter Meta -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={article.title} />
	<meta name="twitter:description" content={article.content.slice(0, 160)} />
	<meta name="twitter:image" content={article.foreImage} />
	<meta name="twitter:image:alt" content={article.title} />
	<meta name="twitter:site" content="@sirneij" />
	<meta name="twitter:creator" content="@sirneij" />
</svelte:head>
