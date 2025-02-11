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
	<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
	<line x1="16" y1="2" x2="16" y2="6" />
	<line x1="8" y1="2" x2="8" y2="6" />
	<line x1="3" y1="10" x2="21" y2="10" />
	<path d="M12 14v4" />
	<path d="M12 14c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" />
</svg>
