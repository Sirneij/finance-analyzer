<script lang="ts">
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import TypewriterEffect from '$lib/components/animations/TypewriterEffect.svelte';
	import Email from '$lib/components/icons/Email.svelte';
	import { CONTACT_EMAIL } from '$lib/utils/contants';
	import { decodeEmail, encodeEmail } from '$lib/utils/helpers/email.helpers';

	let { githubUser } = $props();

	const encodedEmail = encodeEmail(`${CONTACT_EMAIL}`);

	const handleEmailClick = (e: MouseEvent) => {
		e.preventDefault();
		window.location.href = `mailto:${decodeEmail(encodedEmail)}`;
	};
</script>

<AnimatedSection class="mb-16 space-y-4 text-center" y={50}>
	<h1
		class="bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-5xl font-bold text-transparent dark:from-indigo-400 dark:to-teal-400"
	>
		{githubUser.name}
	</h1>
	<p class="text-xl text-gray-600 dark:text-gray-400">
		<TypewriterEffect words={[githubUser.bio]} loop delay={100} />
	</p>

	<!-- New Contact Button -->
	<div class="mt-8">
		<a
			href="#contact"
			onclick={handleEmailClick}
			class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-teal-600 px-6 py-3 text-white transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 dark:from-indigo-400 dark:to-teal-400 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-800"
		>
			<Email class="h-5 w-5" />
			Contact Me
		</a>
	</div>
</AnimatedSection>
