<script lang="ts">
	import type { IArticlePopulated, ITag } from '$lib/types/articles.types';
	import { WEBSITE_URL } from '$lib/utils/contants';
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
					url: `${WEBSITE_URL}/logo.png`
				}
			},
			dateModified: article.updatedAt,
			mainEntityOfPage: {
				'@type': 'WebPage',
				'@id': `${WEBSITE_URL}/blogs/${article.slug}/${article._id}`
			},
			image: article.foreImage,
			keywords: article.tags.map((tag) => tag.name).join(', '),
			description: getFormattedDescription(article.content, article.tags)
		};
	}

	const getFormattedDescription = (content: string, tags: ITag[]) => {
		const contentPreview = content.slice(0, 120) + '...';
		const tagsList = tags.map((tag) => tag.name).join(', ');
		return `${contentPreview} Tagged with ${tagsList}.`;
	};

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
	<!-- Basic SEO Meta -->
	<title>{article.title} | John Owolabi Idogun</title>
	<meta name="description" content={getFormattedDescription(article.content, article.tags)} />
	<meta
		name="keywords"
		content={article.tags.map((tag) => tag.name).join(', ') +
			', software, coding, development, engineering'}
	/>
	<link rel="canonical" href="{WEBSITE_URL}/blogs/{article.slug}/{article._id}" />
	<meta name="copyright" content="John Owolabi Idogun" />
	<meta name="created" content={article.createdAt} />
	<meta name="last-updated" content={article.updatedAt} />

	<!-- Open Graph Meta -->
	<meta property="og:type" content="article" />
	<meta property="og:url" content="{WEBSITE_URL}/blogs/{article.slug}/{article._id}" />
	<meta property="og:title" content={article.title} />
	<meta
		property="og:description"
		content={getFormattedDescription(article.content, article.tags)}
	/>

	<meta property="og:image" content={article.foreImage} />
	<meta property="og:image:alt" content={article.title} />
	<meta property="article:modified_time" content={article.updatedAt} />
	<meta property="article:tag" content={article.tags.map((tag) => tag.name).join(', ')} />

	<!-- Twitter Meta -->
	<meta name="twitter:title" content={article.title} />
	<meta
		name="twitter:description"
		content={getFormattedDescription(article.content, article.tags)}
	/>
	<meta name="twitter:image" content={article.foreImage} />
	<meta name="twitter:image:alt" content={article.title} />
	<meta name="twitter:widgets:new-embed-design" content="on" />
</svelte:head>
