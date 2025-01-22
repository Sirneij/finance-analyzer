<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="stylesheet" type="text/css" href="/themes/night-owl.min.css" />
	<link rel="stylesheet" type="text/css" href="/themes/github.min.css" />
</svelte:head>

{@render children()}
