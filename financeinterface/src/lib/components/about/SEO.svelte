<script lang="ts">
	import { WEBSITE_URL } from '$lib/utils/contants';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.githubData.user.name || 'Developer Portfolio'} - Portfolio</title>
	<link rel="canonical" href={WEBSITE_URL} />
	<link rel="icon" href="/favicon.ico" type="image/x-icon" />
	<meta name="description" content={data.githubData.user.bio || 'Software Engineer Portfolio'} />
	<meta name="author" content={data.githubData.user.name} />
	<meta
		name="keywords"
		content="Portfolio, Software Engineer, {data.githubData.user
			.name}, Cybersecurity, GitHub, Developer Skills"
	/>
	<meta property="og:title" content={`${data.githubData.user.name} - Portfolio`} />
	<meta
		property="og:description"
		content={data.githubData.user.bio || 'Software Engineer Portfolio'}
	/>
	<meta property="og:image" content={data.githubData.user.avatar_url} />
	<meta property="og:url" content={WEBSITE_URL} />
	<meta property="og:site_name" content="John Owolabi Idogun's Portfolio" />
	<meta property="og:type" content="profile" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@Sirneij" />
	<meta name="twitter:title" content="{data.githubData.user.name} - Portfolio" />
	<meta
		name="twitter:description"
		content={data.githubData.user.bio || 'Software Engineer Portfolio'}
	/>
	<meta name="twitter:image" content={data.githubData.user.avatar_url} />
	<meta name="twitter:image:alt" content="Profile picture of {data.githubData.user.name}" />
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "Person",
			"name": `${data.githubData.user.name}`,
			"url": `${WEBSITE_URL}`,
			"image": `${data.githubData.user.avatar_url}`,
			"description": `${data.githubData.user.bio}`,
			"jobTitle": "Software Engineer",
			"sameAs": [
				`https://github.com/${GITHUB_USERNAME}`,
				"https://www.linkedin.com/in/your-linkedin-profile/"
			]
		}
	</script>

	<link
		rel="stylesheet"
		type="text/css"
		href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"
	/>
</svelte:head>
