<script lang="ts">
	import AnimatedSection from '$lib/components/animations/AnimatedSection.svelte';
	import TypewriterEffect from '$lib/components/animations/TypewriterEffect.svelte';
	import Email from '$lib/components/icons/Email.svelte';
	import { CONTACT_EMAIL } from '$lib/utils/contants';
	import { decodeEmail, encodeEmail } from '$lib/utils/helpers/email.helpers';
	import Modal from '$lib/components/reusables/Modal.svelte';
	import FileInput from '$lib/components/transactions/FileInput.svelte';
	import { page } from '$app/state';
	import FormError from '$lib/components/reusables/FormError.svelte';

	let { githubUser, ...props } = $props();
	let isModalOpen = $state(false);

	const encodedEmail = encodeEmail(`${CONTACT_EMAIL}`);

	const handleEmailClick = (e: MouseEvent) => {
		e.preventDefault();
		window.location.href = `mailto:${decodeEmail(encodedEmail)}`;
	};
</script>

<AnimatedSection class="mb-16 space-y-4 text-center" y={50} {...props}>
	<h1
		class="bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-5xl font-bold text-transparent dark:from-indigo-400 dark:to-teal-400"
	>
		{githubUser.name}
	</h1>
	<p class="text-xl text-gray-600 dark:text-gray-400">
		<TypewriterEffect words={[githubUser.bio]} loop delay={100} />
	</p>

	<!-- New Contact Button -->
	<div class="mt-8 flex items-center justify-center space-x-4">
		<a
			href="#contact"
			onclick={handleEmailClick}
			class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-teal-600 px-6 py-3 text-white transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 dark:from-indigo-400 dark:to-teal-400 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-800"
		>
			<Email class="h-5 w-5" />
			Contact Me
		</a>
		{#if page.data.user && page.data.user.email === 'Sirneij@gmail.com'}
			<button
				onclick={() => (isModalOpen = true)}
				class="group relative overflow-hidden rounded-lg bg-blue-500 px-6 py-3 text-white transition-all hover:shadow-lg hover:shadow-blue-500/30"
			>
				<span class="relative z-10">Upload Resume</span>
				<div
					class="absolute inset-0 z-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 transition-opacity group-hover:opacity-100"
				></div>
				<div class="absolute inset-0 z-0 animate-pulse bg-blue-400/20"></div>
			</button>
		{/if}
	</div>
</AnimatedSection>

<!-- Modal -->
{#if isModalOpen}
	<Modal isOpen={isModalOpen} onClose={() => (isModalOpen = false)}>
		<div class="space-y-6">
			<h2 class="text-2xl font-semibold text-gray-900 dark:text-white">Upload Resume</h2>
			<FormError form={page.form} />
			<FileInput accept=".pdf" formaction="?/upload" />
		</div>
	</Modal>
{/if}
