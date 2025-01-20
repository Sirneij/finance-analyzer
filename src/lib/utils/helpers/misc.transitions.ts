import { quintIn, quintOut } from 'svelte/easing';
import { crossfade } from 'svelte/transition';

export const [send, receive] = crossfade({
	duration: (d) => Math.sqrt(d * 200),

	// eslint-disable-next-line no-unused-vars
	fallback(node, _params) {
		const style = getComputedStyle(node);
		const transform = style.transform === 'none' ? '' : style.transform;

		return {
			duration: 600,
			easing: quintOut,
			css: (t) => `
                transform: ${transform} scale(${t});
                opacity: ${t}
            `
		};
	}
});

export const SLIDE_DURATION = 300;

export function sequencedFly(
	node: HTMLElement,
	{ y = 0, x = 0, delay = 0, duration = 1200, index = 0, total = 1, isEntering = true }
) {
	return {
		delay: SLIDE_DURATION + (isEntering ? index : total - index - 1) * 200,
		duration,
		css: (t: number) => {
			const easing = isEntering ? quintOut : quintIn;
			const easedT = easing(t);
			return `
          opacity: ${t};
          transform: translate(${(1 - easedT) * x}px, ${(1 - easedT) * y}px);
        `;
		}
	};
}
