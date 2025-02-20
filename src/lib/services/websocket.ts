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

		this.connect();
	}

	private connect() {
		this.socket = new WebSocket(this.url);
		this.socket.onopen = this.onOpen;
		this.socket.onmessage = this.onMessage;
		this.socket.onclose = this.handleClose;
		this.socket.onerror = this.onError;
	}

	private onOpen = (event: Event) => {
		console.log('WebSocket connection opened:', event);

		const messages = this.neededData.map((data) => ({
			action: data,
			userId: this.userId
		}));

		this.socket.send(JSON.stringify(messages));
	};

	public onMessage = (event: MessageEvent) => {
		// const data = JSON.parse(event.data);
		console.log('WebSocket message received:', event);
	};

	private onError = (event: Event) => {
		console.error('WebSocket error:', event);
	};

	public close() {
		this.userId = '';
		this.neededData = [];

		// Use 1000 code for normal closure
		this.socket.close(1000, 'Normal closure');

		this.socket.onopen = null;
		this.socket.onmessage = null;
		this.socket.onclose = null;
		this.socket.onerror = null;
	}

	private handleClose = (event: CloseEvent) => {
		console.log('WebSocket connection closed:', event);
		this.close();
	};
}
