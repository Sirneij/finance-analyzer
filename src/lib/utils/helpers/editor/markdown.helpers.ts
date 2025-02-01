import { detectOS, normalizeKey } from '$lib/utils/commons';
import type { Action } from 'svelte/action';
import { Handlers } from './commands.helpers';
import type { KeyCombo } from '$lib/types/markdown.types';
import { COMMANDS } from '$lib/utils/contants';

export const useKeyCombinations: Action<HTMLTextAreaElement> = (node: HTMLTextAreaElement) => {
	const keysPressed: Set<string> = new Set();
	const os = detectOS();

	const matchesCombo = (e: KeyboardEvent, combo: KeyCombo): boolean => {
		const isMac = os === 'mac';
		return (
			normalizeKey(e.key) === combo.key &&
			!!combo.shift === e.shiftKey &&
			!!combo.alt ===
				(e.altKey || e.getModifierState('AltGraph') || e.getModifierState('Option')) &&
			(isMac ? !!combo.cmd === e.metaKey : !!combo.ctrl === e.ctrlKey)
		);
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		try {
			const key = normalizeKey(e.key);
			keysPressed.add(key);

			// Find matching command
			const command = COMMANDS.find((cmd) => matchesCombo(e, cmd.shortcut.combo));
			if (command) {
				e.preventDefault();
				Handlers[command.title.toLowerCase()](e, node);
			}
		} catch (error) {
			console.warn('Key handling failed:', error);
		}
	};

	const handleKeyUp = (e: KeyboardEvent) => {
		try {
			keysPressed.delete(normalizeKey(e.key));
		} catch (error) {
			console.warn('Key release handling failed:', error);
		}
	};

	node.addEventListener('keydown', handleKeyDown);
	node.addEventListener('keyup', handleKeyUp);

	return {
		destroy() {
			node.removeEventListener('keydown', handleKeyDown);
			node.removeEventListener('keyup', handleKeyUp);
		}
	};
};

/**
 * Show the info text when the element is focused
 * @param node - The element to focus
 * @param args - The container and the info id
 * @returns - The destroy function
 * @example
 * ```svelte
 * <input use:showInfo={{ container, infoId }} />
 * ```
 */
export const showInfo: Action<
	HTMLDivElement | HTMLTextAreaElement,
	{ container: HTMLDivElement; infoId: string }
> = (
	node: HTMLDivElement | HTMLTextAreaElement | HTMLInputElement,
	args?: { container: HTMLDivElement; infoId: string }
) => {
	const show = () => {
		const info = args?.container.querySelector('#info') as HTMLDivElement;
		if (!info) {
			console.error('Could not find info element in container');
			return;
		}

		const infoTexts = info.querySelectorAll('div');
		infoTexts.forEach((text) => text.classList.add('hidden'));

		const targetInfo = args?.container.querySelector(`#${args.infoId}`);
		if (!targetInfo) {
			console.error(`Could not find element with id ${args?.infoId}`);
			return;
		}

		targetInfo.classList.remove('hidden');
		info.classList.remove('hidden');

		// Get the position of the focused element
		const rect = node.getBoundingClientRect();
		info.style.top = `${rect.top}px`;
	};

	const hide = (e: Event) => {
		const info = args?.container.querySelector('#info');
		if (!info) return;

		const focusEvent = e as FocusEvent;
		if (!info.contains(focusEvent.relatedTarget as Node) && focusEvent.relatedTarget !== info) {
			info.classList.add('hidden');
		}
	};

	if (!node || !args?.container || !args.infoId) return;

	node.addEventListener('focus', show);
	node.addEventListener('blur-sm', hide);

	return {
		destroy() {
			node.removeEventListener('focus', show);
			node.removeEventListener('blur-sm', hide);
		}
	};
};

type CharacterPairs = {
	[key: string]: string;
};

const PAIRS: CharacterPairs = {
	'[': ']',
	'(': ')',
	'{': '}',
	'"': '"',
	"'": "'",
	'`': '`',
	'*': '*',
	_: '_'
};

export function handleAutoPair(e: KeyboardEvent, textarea: HTMLTextAreaElement) {
	const char = e.key;
	const pair = PAIRS[char];

	if (!pair) return;

	e.preventDefault();

	const { selectionStart, selectionEnd, value } = textarea;
	const selectedText = value.slice(selectionStart, selectionEnd);

	// If text is selected, wrap it
	if (selectionStart !== selectionEnd) {
		const newText = char + selectedText + pair;
		textarea.value = value.slice(0, selectionStart) + newText + value.slice(selectionEnd);
		textarea.selectionStart = selectionStart;
		textarea.selectionEnd = selectionEnd + 2;
		return;
	}

	// Auto-pair characters
	textarea.value = value.slice(0, selectionStart) + char + pair + value.slice(selectionStart);
	textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
}

export function editorAutoComplete(node: HTMLTextAreaElement) {
	const handleKeydown = (e: KeyboardEvent) => handleAutoPair(e, node);

	node.addEventListener('keydown', handleKeydown);

	return {
		destroy() {
			node.removeEventListener('keydown', handleKeydown);
		}
	};
}
