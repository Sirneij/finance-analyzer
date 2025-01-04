<script lang="ts">
	let { trend, ...props } = $props();
</script>

<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
	<path d={trend === 'up' ? 'M5 15l7-7 7 7' : 'M5 9l7 7 7-7'} />
</svg>
