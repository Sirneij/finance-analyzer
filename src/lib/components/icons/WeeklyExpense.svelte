<script lang="ts">
	let { ...props } = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width="24"
	height="24"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	{...props}
>
	<path d="M4 3L2 5v14a2 2 0 002 2h16a2 2 0 002-2V5l-2-2H4z" />
	<path d="M7 3v4" />
	<path d="M17 3v4" />
	<path d="M2 9h20" />
	<circle cx="12" cy="15" r="2" />
	<path d="M10 15h4" />
</svg>
