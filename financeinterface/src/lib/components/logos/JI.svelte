<script lang="ts">
	let { size = 40, animated = true, ...props } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 100 100"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	class:animated
	{...props}
>
	<!-- Outer Circle -->
	<circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="2" class="circle" />

	<!-- Decorative Dot for J -->
	<circle cx="35" cy="30" r="2" fill="currentColor" class="letter" />

	<!-- Enhanced Letter J -->
	<path
		d="M25 30 H45
        M35 30 V60 
        C35 65 32 70 25 70"
		stroke="currentColor"
		stroke-width="3"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="letter"
	/>

	<!-- Decorative Center Dot -->
	<circle cx="50" cy="50" r="2.5" fill="currentColor" class="letter" />
	<circle cx="50" cy="50" r="4" stroke="currentColor" stroke-width="1" fill="none" class="letter" />

	<!-- Enhanced Letter I -->
	<circle cx="65" cy="30" r="2" fill="currentColor" class="letter" />
	<path
		d="M65 35L65 65"
		stroke="currentColor"
		stroke-width="3"
		stroke-linecap="round"
		class="letter"
	/>
	<circle cx="65" cy="70" r="2" fill="currentColor" class="letter" />

	<!-- Optional: Decorative Elements -->
	<path
		d="M60 30 H70"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		class="letter"
	/>
	<path
		d="M60 70 H70"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		class="letter"
	/>
</svg>

<style>
	.animated .circle {
		stroke-dasharray: 283;
		stroke-dashoffset: 283;
		animation: draw 1s ease forwards;
	}

	.animated .letter {
		opacity: 0;
		animation: fade 0.5s ease forwards 0.8s;
	}

	@keyframes draw {
		to {
			stroke-dashoffset: 0;
		}
	}

	@keyframes fade {
		to {
			opacity: 1;
		}
	}
</style>
