<script lang="ts">
	import { onMount } from 'svelte';

	let canvas = $state<HTMLCanvasElement | null>(null);
	let particles: Particle[] = [];
	let animationId: number;

	class Particle {
		x: number;
		y: number;
		size: number;
		speedX: number;
		speedY: number;
		canvas: HTMLCanvasElement;
		ctx: CanvasRenderingContext2D;

		constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
			this.ctx = ctx;
			this.canvas = canvas;
			this.x = Math.random() * canvas.width;
			this.y = Math.random() * canvas.height;
			this.size = Math.random() * 3;
			this.speedX = Math.random() * 3 - 1.5;
			this.speedY = Math.random() * 3 - 1.5;
		}

		update() {
			this.x += this.speedX;
			this.y += this.speedY;

			if (this.x > this.canvas.width) this.x = 0;
			if (this.x < 0) this.x = this.canvas.width;
			if (this.y > this.canvas.height) this.y = 0;
			if (this.y < 0) this.y = this.canvas.height;
		}

		draw() {
			this.ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
			this.ctx.beginPath();
			this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
			this.ctx.fill();
		}
	}

	function init() {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		particles = [];
		for (let i = 0; i < 50; i++) {
			particles.push(new Particle(ctx, canvas));
		}
	}

	function handleResize() {
		if (!canvas) return;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		init();
	}

	function animate() {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		particles.forEach((particle) => {
			particle.update();
			particle.draw();
		});

		animationId = requestAnimationFrame(animate);
	}

	onMount(() => {
		if (!canvas) return;

		handleResize();
		animate();

		return () => {
			if (animationId) cancelAnimationFrame(animationId);
			particles = [];
		};
	});
</script>

<svelte:window on:resize={handleResize} />

<canvas bind:this={canvas} class="fixed inset-0 -z-10 h-full w-full"></canvas>
