<script lang="ts">
	let { ...props } = $props();
</script>

<svg
	class="h-14 w-14 text-indigo-600 dark:text-indigo-400 dark:drop-shadow-[0_0_8px_rgba(96,165,250,0.4)]"
	viewBox="0 0 24 24"
	fill="currentColor"
	{...props}
>
	<path
		d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 6h-4v4h4v4h-4v-4H7v-4h4V5h4v4z"
	/>
</svg>
