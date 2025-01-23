interface TextCommand {
	text: string;
	startOffset: number;
	selectionLength: number;
}

const MARKDOWN_PATTERNS = {
	BOLD: '****',
	ITALIC: '*emphasize text*',
	LINK: '[text](link)',
	UNORDERED_LIST: '\n- First item\n- Second item\n',
	ORDERED_LIST: '\n1. First item\n2. Second item\n',
	HEADING: '\n## Your heading two \n\n',
	IMAGE: '![alt text](url)',
	GITHUB: '\n{% github {owner}/{repo-name} %}\n',
	CODE_BLOCK: '\n```language:filename {line nos} runnable:\n<code here>\n```',
	NOTE: '\n<div class="admonition note">\n<span class="title"><b>Note:</b></span>\n<p></p>\n</div>',
	TIP: '\n<div class="admonition tip">\n<span class="title"><b>Tip:</b></span>\n<p></p>\n</div>',
	WARNING:
		'\n<div class="admonition warning">\n<span class="title"><b>Warning:</b></span>\n<p></p>\n</div>',
	QUOTE: '\n> Quote here\n',
	INLINE_CODE: '`code here`',
	TABLE: '\n| Header 1 | Header 2 |\n| --- | --- |\n| Row 1 | Row 2 |\n',
	TASK: '- [ ] Task 1\n- [x] Task 2\n'
};

const setCaretPosition = (ctrl: HTMLTextAreaElement, startPos: number, endPos: number) => {
	if (ctrl.setSelectionRange) {
		ctrl.focus();
		ctrl.setSelectionRange(startPos, endPos);
	}
};

export const updateTexareaValue = (
	contentTextArea: HTMLTextAreaElement,
	text: string,
	posStart: number,
	posEnd = 0
) => {
	if (contentTextArea) {
		const start = contentTextArea.selectionStart + posStart;
		const end = start + (posEnd || 0);
		contentTextArea.value = `${contentTextArea.value.slice(0, contentTextArea.selectionStart)}${text}${contentTextArea.value.slice(contentTextArea.selectionStart)}`;
		setCaretPosition(contentTextArea, start, end);
	}
};

const toggleCommand = (
	event: Event,
	contentTextArea: HTMLTextAreaElement,
	command: TextCommand
) => {
	const { text, startOffset, selectionLength } = command;
	if (contentTextArea.value.indexOf(text) !== -1) {
		contentTextArea.value = contentTextArea.value.replace(text, '');
	} else {
		updateTexareaValue(contentTextArea, text, startOffset, selectionLength);
	}
};

const createCommandHandler = (command: TextCommand) => {
	return (event: Event, contentTextArea: HTMLTextAreaElement) => {
		toggleCommand(event, contentTextArea, command);
	};
};

type HandlerFunction = (e: Event, textArea: HTMLTextAreaElement) => void;

interface HandlersType {
	[key: string]: HandlerFunction;
}

export const Handlers: HandlersType = {
	bold: createCommandHandler({ text: MARKDOWN_PATTERNS.BOLD, startOffset: 2, selectionLength: 0 }),
	italize: createCommandHandler({
		text: MARKDOWN_PATTERNS.ITALIC,
		startOffset: 1,
		selectionLength: 13
	}),
	link: createCommandHandler({ text: MARKDOWN_PATTERNS.LINK, startOffset: 1, selectionLength: 4 }),
	unorderedlist: createCommandHandler({
		text: MARKDOWN_PATTERNS.UNORDERED_LIST,
		startOffset: 3,
		selectionLength: 10
	}),
	orderedlist: createCommandHandler({
		text: MARKDOWN_PATTERNS.ORDERED_LIST,
		startOffset: 4,
		selectionLength: 10
	}),
	heading: createCommandHandler({
		text: MARKDOWN_PATTERNS.HEADING,
		startOffset: 4,
		selectionLength: 15
	}),
	uploadimage: createCommandHandler({
		text: MARKDOWN_PATTERNS.IMAGE,
		startOffset: 2,
		selectionLength: 8
	}),
	github: createCommandHandler({
		text: MARKDOWN_PATTERNS.GITHUB,
		startOffset: 11,
		selectionLength: 7
	}),
	codeblock: createCommandHandler({
		text: MARKDOWN_PATTERNS.CODE_BLOCK,
		startOffset: 4,
		selectionLength: 45
	}),
	blockquote: createCommandHandler({
		text: MARKDOWN_PATTERNS.QUOTE,
		startOffset: 3,
		selectionLength: 10
	}),
	code: createCommandHandler({
		text: MARKDOWN_PATTERNS.INLINE_CODE,
		startOffset: 1,
		selectionLength: 9
	}),
	table: createCommandHandler({
		text: MARKDOWN_PATTERNS.TABLE,
		startOffset: 55,
		selectionLength: 0
	}),
	task: createCommandHandler({
		text: MARKDOWN_PATTERNS.TASK,
		startOffset: 6,
		selectionLength: 6
	}),
	note: createCommandHandler({
		text: MARKDOWN_PATTERNS.NOTE,
		startOffset: 6,
		selectionLength: 6
	}),
	tip: createCommandHandler({
		text: MARKDOWN_PATTERNS.TIP,
		startOffset: 6,
		selectionLength: 6
	}),
	warning: createCommandHandler({
		text: MARKDOWN_PATTERNS.WARNING,
		startOffset: 6,
		selectionLength: 6
	})
};
