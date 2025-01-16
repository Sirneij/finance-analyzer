// src/lib/services/websocket.ts

export enum NEEDEDDATA {
	ANALYSIS = 'analyze',
	SUMMARY = 'summary'
}
export class WebSocketService {
	public socket: WebSocket;
	private url: string;
	private userId: string;
	private neededData: NEEDEDDATA[] = [];

	constructor(url: string, userId: string, neededData: NEEDEDDATA[]) {
		this.url = url;
		this.userId = userId;
		this.neededData = neededData;
		this.socket = new WebSocket(this.url);

		this.socket.onopen = this.onOpen;
		this.socket.onmessage = this.onMessage;
		this.socket.onclose = this.onClose;
		this.socket.onerror = this.onError;
	}

	private onOpen = (event: Event) => {
		// console.log('WebSocket connection opened:', event);
		const messages = this.neededData.map((data) => {
			return {
				action: data,
				userId: this.userId
			};
		});

		this.socket.send(JSON.stringify(messages));
	};

	public onMessage = (event: MessageEvent) => {
		const data = JSON.parse(event.data);
		// console.log('WebSocket message received:', data);
	};

	private onClose = (event: CloseEvent) => {
		// console.log('WebSocket connection closed:', event);
	};

	private onError = (event: Event) => {
		// console.error('WebSocket error:', event);
	};

	public close() {
		this.userId = '';
		this.neededData = [];
		this.socket.onopen = null;
		this.socket.onmessage = null;
		this.socket.onclose = null;
		this.socket.onerror = null;
		this.socket.close();
	}
}
