export function createCountAnimation(start: number, end: number, duration = 2000) {
	let currentValue = $state(start);
	let animationFrame: number;

	function easeOutCubic(x: number) {
		return 1 - Math.pow(1 - x, 3);
	}

	function startAnimation() {
		const startTime = performance.now();

		function update() {
			const currentTime = performance.now();
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);

			// Keep floating point precision
			currentValue = parseFloat((start + (end - start) * easeOutCubic(progress)).toFixed(2));

			if (progress < 1) {
				animationFrame = requestAnimationFrame(update);
			}
		}

		animationFrame = requestAnimationFrame(update);
	}

	function cleanup() {
		if (animationFrame) {
			cancelAnimationFrame(animationFrame);
		}
	}

	return {
		get value() {
			return currentValue;
		},
		startAnimation,
		cleanup
	};
}
