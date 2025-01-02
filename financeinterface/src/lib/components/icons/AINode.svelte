<script lang="ts">
	let { ...props } = $props();
</script>

<svg
	class="h-16 w-16 text-purple-600 dark:text-purple-400 dark:drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]"
	viewBox="0 0 24 24"
	fill="currentColor"
	{...props}
>
	<path
		d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"
	/>
</svg>
