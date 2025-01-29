<script lang="ts">
	let { text = '' } = $props();
</script>

<span
	class="pointer-events-none absolute -left-4 top-10 z-50 w-48 rounded bg-gray-800 p-2 text-xs font-medium text-white opacity-0 shadow transition-opacity group-hover:opacity-100 dark:bg-gray-700"
>
	{text}
</span>
