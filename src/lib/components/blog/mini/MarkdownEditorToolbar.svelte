<script lang="ts">
	import { EditorIcons } from '$lib/components/icons';
	import { COMMANDS } from '$lib/utils/contants';
	import { Handlers } from '$lib/utils/helpers/editor/commands.helpers';
	import { fly } from 'svelte/transition';

	let { textArea = $bindable() }: { textArea: HTMLTextAreaElement } = $props();
</script>

<div class="flex flex-wrap items-center gap-2">
	{#each COMMANDS as command}
		{@const Icon = EditorIcons[command.title.toLowerCase() as keyof typeof EditorIcons]}
		<div class="group relative">
			<!-- Added group class here -->
			<button
				type="button"
				class="rounded px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
				title={command.title}
				onclick={(e) => Handlers[command.title.toLowerCase()](e, textArea)}
			>
				<span class="sr-only">{command.title}</span>
				<Icon class="h-4 w-4" />
			</button>

			{#if command.shortcut.display}
				<div
					class="pointer-events-none invisible absolute -top-8 left-1/2 z-50 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:visible dark:bg-gray-700"
					transition:fly={{ y: 10, duration: 200 }}
				>
					{command.shortcut.display}
					<div
						class="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-800 dark:bg-gray-700"
					></div>
				</div>
			{/if}
		</div>
	{/each}
</div>
