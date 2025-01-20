import type { Notification, NotificationType } from '$lib/types/notification.types';
import { writable } from 'svelte/store';

export const notifications = writable<Notification[]>([]);

export function addNotification(message: string, type: NotificationType = 'info', duration = 5000) {
	const id = crypto.randomUUID();
	notifications.update((n) => [...n, { id, type, message, duration }]);

	if (duration)
		setTimeout(() => {
			removeNotification(id);
		}, duration);
}

export function removeNotification(id: string) {
	notifications.update((n) => n.filter((notification) => notification.id !== id));
}
