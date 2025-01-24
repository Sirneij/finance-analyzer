<script lang="ts">
	import { getNotifications, removeNotification } from '$lib/states/notification.svelte';
	import { slide } from 'svelte/transition';
	import type { Notification } from '$lib/types/notification.types';
	import Close from '$lib/components/icons/Close.svelte';
	const bgColors: Record<Notification['type'], string> = {
		info: 'bg-indigo-500',
		success: 'bg-green-500',
		warning: 'bg-yellow-500',
		error: 'bg-red-500'
	};
</script>

<div class="fixed right-4 top-4 z-50 flex flex-col gap-2">
	{#each getNotifications() as notification (notification.id)}
		<div
			transition:slide
			class="min-w-[300px] rounded-lg p-4 text-white shadow-lg {bgColors[notification.type]}"
		>
			<div class="flex items-center justify-between">
				<p>{notification.message}</p>
				<button
					class="ml-4 rounded-full p-1 hover:bg-white/20"
					on:click={() => removeNotification(notification.id)}
					aria-label="Close notification"
				>
					<Close class="h-4 w-4" />
				</button>
			</div>
		</div>
	{/each}
</div>
