import { browser } from '$app/environment';
import type { Notification, NotificationType } from '$lib/types/notification.types';

type TimeoutHandle = ReturnType<typeof setTimeout>;

function createNotificationState() {
	let notifications = $state<Notification[]>([]);
	const timeouts = new Map<string, TimeoutHandle>();

	function getNotifications() {
		return notifications;
	}

	function addNotification(message: string, type: NotificationType = 'info', duration = 5000) {
		if (!browser) return;

		const notification: Notification = {
			id: crypto.randomUUID(),
			type,
			message,
			duration
		};

		notifications = [...notifications, notification];

		if (duration) {
			const timeout = setTimeout(() => {
				removeNotification(notification.id);
			}, duration);
			timeouts.set(notification.id, timeout);
		}
	}

	function removeNotification(id: string) {
		if (!browser) return;
		const timeout = timeouts.get(id);
		if (timeout) {
			clearTimeout(timeout);
			timeouts.delete(id);
		}
		notifications = notifications.filter((n) => n.id !== id);
	}

	function clearNotifications() {
		if (!browser) return;
		timeouts.forEach(clearTimeout);
		timeouts.clear();
		notifications = [];
	}

	return {
		getNotifications,
		addNotification,
		removeNotification,
		clearNotifications
	};
}

export const { getNotifications, addNotification, removeNotification, clearNotifications } =
	createNotificationState();
