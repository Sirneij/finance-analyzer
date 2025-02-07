type LoadingStatus = 'IDLE' | 'NAVIGATING' | 'LOADING';

interface LoadingState {
	status: LoadingStatus;
	message: string;
}

export class LoadingManager {
	private status = $state<LoadingStatus>('IDLE');
	private message = $state('');
	private isVisible = $state(true);

	// Computed state
	readonly state = $derived<LoadingState>({
		status: this.status,
		message: this.message
	});

	readonly visible = $derived(this.isVisible);

	setNavigating(isNavigating: boolean) {
		this.status = isNavigating ? 'NAVIGATING' : 'IDLE';
		this.message = '';
		this.isVisible = isNavigating;
	}

	setLoading(isLoading: boolean, message = '') {
		this.status = isLoading ? 'LOADING' : 'IDLE';
		this.message = isLoading ? message : '';
		this.isVisible = isLoading;
	}
}

// Create a singleton instance
export const loadingManager = new LoadingManager();
