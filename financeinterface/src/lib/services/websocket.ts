// src/lib/services/websocket.ts
export class WebSocketService {
	public socket: WebSocket;
	private url: string;
	private userId: string;

	constructor(url: string, userId: string) {
		this.url = url;
		this.userId = userId;
		this.socket = new WebSocket(url);

		this.socket.onopen = this.onOpen;
		this.socket.onmessage = this.onMessage;
		this.socket.onclose = this.onClose;
		this.socket.onerror = this.onError;
	}

	public onOpen = (event: Event) => {
		console.log('WebSocket connection opened:', event);
		this.socket.send(JSON.stringify({ action: 'progress', userId: this.userId }));
	};

	public onMessage = (event: MessageEvent) => {
		const data = JSON.parse(event.data);
		switch (data.type) {
			case 'transactionUpdate':
				// Handle transaction update
				break;
			case 'notification':
				// Handle notification
				break;
			default:
				console.log('WebSocket message received:', data);
		}
	};

	public onClose = (event: CloseEvent) => {
		console.log('WebSocket connection closed:', event);
	};

	public onError = (event: Event) => {
		console.error('WebSocket error:', event);
	};

	public sendMessage(message: string) {
		if (this.socket.readyState === WebSocket.OPEN) {
			this.socket.send(message);
		} else {
			console.error('WebSocket is not open. Ready state:', this.socket.readyState);
		}
	}

	public close() {
		this.socket.close();
	}
}
