<script lang="ts">
	let { words = [], loop = false, delay = 100 } = $props();

	let currentWord = $state(''),
		wordIndex = 0,
		charIndex = 0,
		isDeleting = false;

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

	$effect(() => {
		if (words.length) type();
	});
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
