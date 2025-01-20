<script lang="ts">
	let { isSmall, ...props } = $props();
</script>

<svg
	viewBox={isSmall ? '0 0 40 40' : '0 0 100 40'}
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	{...props}
>
	<path d="M10 30L20 10L30 30" stroke="#4F46E5" stroke-width="3" />
	{#if !isSmall}
		<path d="M35 10H45V30H35" stroke="#4F46E5" stroke-width="3" />
		<text x="55" y="25" class="text-sm font-bold" fill="#374151">AI</text>
	{/if}
</svg>
