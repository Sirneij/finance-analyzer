export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
	id: string;
	type: NotificationType;
	message: string;
	duration: number;
}

export interface ProgressSteps {
	progress: number;
	message: string;
}
