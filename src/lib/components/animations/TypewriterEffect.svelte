<script lang="ts">
	type TypewriterEffectProps = {
		words: string[];
		loop?: boolean;
		delay?: number;
	};
	let { words, loop = false, delay = 100 }: TypewriterEffectProps = $props();

	let currentWord = $state(''),
		wordIndex = 0,
		charIndex = 0,
		isDeleting = false,
		timeout: ReturnType<typeof setTimeout>;

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
			timeout = setTimeout(type, delay * 2);
		} else if (isDeleting && charIndex === 0) {
			isDeleting = false;
			wordIndex = loop ? (wordIndex + 1) % words.length : wordIndex + 1;
			timeout = setTimeout(type, delay / 2);
		} else {
			timeout = setTimeout(type, delay);
		}
	};

	$effect(() => {
		if (words.length) {
			type();
		}
		return () => {
			if (timeout) clearTimeout(timeout);
		};
	});
</script>

<span class="typewriter">{currentWord}<span class="cursor">|</span></span>
