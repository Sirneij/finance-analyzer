<script lang="ts">
	let { ...props } = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	{...props}
>
	<!-- Large central circle -->
	<circle cx="12" cy="12" r="3" />

	<!-- Smaller connected circles -->
	<circle cx="5" cy="5" r="2" />
	<circle cx="19" cy="5" r="2" />
	<circle cx="5" cy="19" r="2" />
	<circle cx="19" cy="19" r="2" />

	<!-- Connecting lines -->
	<line x1="7" y1="7" x2="10" y2="10" />
	<line x1="17" y1="7" x2="14" y2="10" />
	<line x1="7" y1="17" x2="10" y2="14" />
	<line x1="17" y1="17" x2="14" y2="14" />
</svg>
