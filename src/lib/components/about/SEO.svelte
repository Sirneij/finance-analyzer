<script lang="ts">
	import { WEBSITE_URL } from '$lib/utils/contants';

	let { data } = $props();

	const title = `${data.githubData.user.name || 'Developer Portfolio'} - ${data.githubData.user.bio}`;
	const description = `${data.githubData.user.name} - ${data.githubData.user.bio || 'Software Engineer and Cybersecurity Enthusiast'}`;
</script>

<svelte:head>
	<!-- Basic Meta Tags -->
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="author" content={data.githubData.user.name} />
	<meta name="theme-color" content="#ffffff" />
	<meta name="language" content="en" />

	<!-- Favicons -->
	<link rel="icon" type="image/png" href="/ji/favicon-96x96.png" sizes="96x96" />
	<link rel="icon" type="image/svg+xml" href="/ji/favicon.svg" />
	<link rel="shortcut icon" href="/ji/favicon.ico" />
	<link rel="apple-touch-icon" sizes="180x180" href="/ji/apple-touch-icon.png" />
	<meta name="apple-mobile-web-app-title" content={WEBSITE_URL} />
	<link rel="manifest" href="/ji/site.webmanifest" />
	<link rel="canonical" href={WEBSITE_URL} />
	<link rel="icon" href="/ji/favicon.ico" type="image/x-icon" />

	<!-- Open Graph -->
	<meta property="og:type" content="profile" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={data.githubData.user.avatar_url} />
	<meta property="og:image:alt" content="Profile picture of {data.githubData.user.name}" />
	<meta property="og:url" content={WEBSITE_URL} />
	<meta property="og:site_name" content={description} />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@Sirneij" />
	<meta name="twitter:creator" content="@Sirneij" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={data.githubData.user.avatar_url} />
	<meta name="twitter:image:alt" content="Profile picture of {data.githubData.user.name}" />

	<!-- JSON-LD -->
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "Person",
			"name": `${data.githubData.user.name}`,
			"url": `${WEBSITE_URL}`,
			"image": `${data.githubData.user.avatar_url}`,
			"description": `${description}`,
			"jobTitle": "Software Engineer, Cybersecurity Enthusiast and Technical Writer",
			"sameAs": [
				`https://github.com/sirneij`,
				"https://www.linkedin.com/in/john-owolabi-idogun/",
				"https://twitter.com/Sirneij"
			],
			"alumniOf": {
				"@type": "University",
				"name": "Federal University of Technology, Akure, Ondo State, Nigeria"
			},
			"knowsAbout": ["Software Engineering", "Cybersecurity", "Technical Writing"]
		}
	</script>
</svelte:head>
