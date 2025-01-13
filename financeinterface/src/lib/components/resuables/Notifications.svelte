<script lang="ts">
	import { notifications, removeNotification } from '$lib/states/notification';
	import { slide } from 'svelte/transition';
	import type { Notification } from '$lib/types/notification.types';
	const bgColors: Record<Notification['type'], string> = {
		info: 'bg-indigo-500',
		success: 'bg-green-500',
		warning: 'bg-yellow-500',
		error: 'bg-red-500'
	};
</script>

<div class="fixed right-4 top-4 z-50 flex flex-col gap-2">
	{#each $notifications as notification (notification.id)}
		<div
			transition:slide
			class="min-w-[300px] rounded-lg p-4 text-white shadow-lg {bgColors[notification.type]}"
		>
			<div class="flex items-center justify-between">
				<p>{notification.message}</p>
				<button
					class="ml-4 rounded-full p-1 hover:bg-white/20"
					onclick={() => removeNotification(notification.id)}
					aria-label="Close notification"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			</div>
		</div>
	{/each}
</div>
