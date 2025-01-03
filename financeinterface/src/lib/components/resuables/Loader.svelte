<script lang="ts">
	const { message, width } = $props();
</script>

<div class="loading">
	<p class="simple-loader" style={width ? `width: ${width}px` : ''}></p>
	{#if message}
		<p class="dark:text-white">{message}</p>
	{/if}
</div>

<style>
	.loading {
		margin-left: auto;
		margin-right: auto;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.loading p {
		margin-left: 0.5rem;
	}
</style>
