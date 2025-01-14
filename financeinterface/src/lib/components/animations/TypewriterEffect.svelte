<script lang="ts">
	export let words: string[] = [];
	export let loop: boolean = false;
	export let delay: number = 100;

	let currentWord = '';
	let wordIndex = 0;
	let charIndex = 0;
	let isDeleting = false;

	const type = () => {
		const word = words[wordIndex];

		if (isDeleting) {
			currentWord = word.substring(0, charIndex - 1);
			charIndex--;
		} else {
			currentWord = word.substring(0, charIndex + 1);
			charIndex++;
		}

		if (!isDeleting && charIndex === word.length) {
			isDeleting = true;
			setTimeout(type, delay * 2);
		} else if (isDeleting && charIndex === 0) {
			isDeleting = false;
			wordIndex = loop ? (wordIndex + 1) % words.length : wordIndex + 1;
			setTimeout(type, delay / 2);
		} else {
			setTimeout(type, delay);
		}
	};

	$: {
		if (words.length) type();
	}
</script>

<span class="typewriter">{currentWord}<span class="cursor">|</span></span>

<style>
	.cursor {
		animation: blink 1s step-end infinite;
	}

	@keyframes blink {
		from,
		to {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
	}
</style>
