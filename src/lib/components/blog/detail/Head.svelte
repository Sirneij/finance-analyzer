<script lang="ts">
	import type { IArticlePopulated } from '$lib/types/articles.types';

	let { article }: { article: IArticlePopulated } = $props();
</script>

<svelte:head>
	<title>{article.title} | John Owolabi Idogun Writes</title>
	<meta name="author" content="John Owolabi Idogun" />
	<meta name="description" content={article.content.slice(0, 160)} />

	<!-- Open Graph -->
	<meta property="og:title" content={article.title} />
	<meta property="og:description" content={article.content.slice(0, 160)} />
	<meta property="og:image" content={article.foreImage} />
	<meta property="og:type" content="article" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={article.title} />
	<meta name="twitter:description" content={article.content.slice(0, 160)} />
	<meta name="twitter:image" content={article.foreImage} />

	<!-- Article Schema -->
	<script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": article.title,
      "image": article.foreImage,
      "datePublished": article.createdAt,
      "dateModified": article.updatedAt,
      "author": {
        "@type": "Person",
        "name": "John Owolabi Idogun"
      }
    })}
	</script>
</svelte:head>
