export type ToolbarAction = {
	icon: string;
	title: string;
	shortcut: string;
	action: (text: string) => { text: string; selectionStart: number; selectionEnd: number };
};

export type FileUploadResult = {
	url: string;
	name: string;
};

export type KeyCombo = {
	key: string;
	shift?: boolean;
	alt?: boolean;
	ctrl?: boolean;
	cmd?: boolean;
};

export type Command = {
	title: string;
	shortcut: {
		display: string;
		combo: {
			key: string;
			shift?: boolean;
			ctrl?: boolean;
			cmd?: boolean;
			alt?: boolean;
		};
	};
};
