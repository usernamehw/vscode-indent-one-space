import { commands, ExtensionContext, Position, Range, Selection, TextEditor, TextLine, workspace } from 'vscode';
import { ExtensionConfig } from './types';

function isCompleteRange(selection: Selection, firstLine: TextLine, lastLine: TextLine): boolean {
	const selectionStart = firstLine.text.slice(selection.start.character);
	const selectionEnd = lastLine.text.slice(0, selection.end.character);

	return firstLine.text.trim() === selectionStart.trim() && lastLine.text.trim() === selectionEnd.trim();
}

function indentOneSpace(isReverse: boolean, editor: TextEditor) {
	const config = workspace.getConfiguration('indentOneSpace') as any as ExtensionConfig;
	const newSelections: Selection[] = [];

	editor.edit(builder => {
		for (const selection of editor.selections) {
			let start = selection.start;
			let end = selection.end;
			const isSelectionStartHasCursor = start.line === selection.active.line && start.character === selection.active.character;

			if (editor.selections.length === 1 && selection.isSingleLine && !config.workOnSingleLine) {
				commands.executeCommand('type', { text: ' ' });
				return;
			}

			const lines: TextLine[] = [];
			for (let i = start.line; i <= end.line; i++) {
				lines.push(editor.document.lineAt(i));
			}

			if (isReverse) { // Move left
				if (selection.isSingleLine && start.character === end.character &&
					lines[0].text.slice(0, selection.start.character).trim() !== '') {
					commands.executeCommand('type', { text: ' ' });
					return;
				}
				let isStartLineShifted = false;
				let isEndLineShifted = false;

				if (!config.cramReversed && lines.some(line => line.text[0] !== ' ')) {
					// window.showInformationMessage('Cram disabled!');// Dev notification
					if (isSelectionStartHasCursor) {
						[start, end] = [end, start];
					}

					newSelections.push(new Selection(start, end));// preserve old selection
					continue;
				}

				if (lines.every(line => line.text[0] !== ' ') && end.character !== 0) {
					// window.showInformationMessage('Nothing to cram!');// Dev notification
					if (isSelectionStartHasCursor) {
						[start, end] = [end, start];
					}

					newSelections.push(new Selection(start, end));
					continue;
				}

				lines.forEach((line, i) => {
					if (line.text[0] === ' ') {
						if (i === 0) {
							isStartLineShifted = true;
						}
						if (i === lines.length - 1) {
							isEndLineShifted = true;
						}

						builder.delete(new Range(line.lineNumber, 0, line.lineNumber, 1));
					}
				});

				if (isSelectionStartHasCursor) {
					[start, end] = [end, start];
				}

				let newEndChar = end.character;
				let newStartChar = start.character;

				if (isStartLineShifted) {
					newEndChar = end.character - 1;
				}
				if (isEndLineShifted) {
					newStartChar = start.character - 1;
				}

				if (selection.isSingleLine) {
					if (newEndChar === -1) {
						newStartChar += 1;
					}
					if (newStartChar === -1) {
						newEndChar += 1;
					}
				}

				if (newStartChar === -1) {
					newStartChar = 0;
				}
				if (newEndChar === -1) {
					newEndChar = 0;
				}

				newSelections.push(new Selection(
					start.line, newStartChar,
					end.line, newEndChar,
				));
			} else { // Move right
				if (config.onlyCompleteRange && !isCompleteRange(selection, lines[0], lines[lines.length - 1])) {
					commands.executeCommand('type', { text: ' ' });
					return;
				}

				for (let i = start.line; i <= end.line; i++) {
					builder.insert(new Position(i, 0), ' ');
				}

				if (isSelectionStartHasCursor) {
					[start, end] = [end, start];
				}

				newSelections.push(new Selection(
					start.line, start.character + 1,
					end.line, end.character + 1,
				));
			}
		}
	});

	editor.selections = newSelections;
}

export function activate(context: ExtensionContext) {
	const indent = commands.registerTextEditorCommand('extension.indentOneSpace', indentOneSpace.bind(null, false));
	const outdent = commands.registerTextEditorCommand('extension.reverseIndentOneSpace', indentOneSpace.bind(null, true));

	context.subscriptions.push(indent, outdent);
}

export function deactivate() { }
