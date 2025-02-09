<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface CheckboxProps extends Omit<HTMLInputAttributes, 'type' | 'class'> {
		showLabel?: boolean;
		label: string;
	}

	let { showLabel = false, label, ...props }: CheckboxProps = $props();
</script>

<label
	class="relative flex cursor-pointer items-center gap-2"
	for={label.toLowerCase().replace(/\s/g, '-')}
>
	<div class="relative">
		<input
			id={label.toLowerCase().replace(/\s/g, '-')}
			type="checkbox"
			class="peer sr-only"
			{...props}
		/>
		<svg
			class="size-5.5 shrink-0 transition-opacity {props.checked ? 'opacity-100' : 'opacity-40'}"
			fill="none"
			stroke-linecap="square"
			stroke-width="1.5"
		>
			<circle
				cx="11"
				cy="11"
				r="11"
				class="fill-indigo-400/25 transition-colors peer-hover:fill-indigo-400/40"
			/>
			<circle
				cx="11"
				cy="11"
				r="10.5"
				class="stroke-indigo-400/25 transition-colors peer-hover:stroke-indigo-400/40"
			/>
			<path
				d="M8 11.5L10.5 14L14 8"
				class="stroke-indigo-800 transition-opacity dark:stroke-indigo-300 {props.checked
					? 'opacity-100'
					: 'opacity-0'}"
			/>
		</svg>
	</div>
	{#if showLabel}
		<span class="select-none text-sm text-gray-700 dark:text-gray-300">{label}</span>
	{/if}
</label>
