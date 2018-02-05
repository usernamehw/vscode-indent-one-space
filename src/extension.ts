'use strict';
import * as vscode from 'vscode';
import { ExtensionContext, Position, Range, Selection } from 'vscode';

function isCompleteRange(selection: Selection, firstLine: vscode.TextLine, lastLine: vscode.TextLine): boolean {
    const selectionStart = firstLine.text.slice(selection.start.character);
    const selectionEnd = lastLine.text.slice(0, selection.end.character);

    return firstLine.text.trim() === selectionStart.trim() && lastLine.text.trim() === selectionEnd.trim();
}

function indentOneSpace(isReverse: boolean): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const config = vscode.workspace.getConfiguration('indentOneSpace');
    const isWorkOnSingleLine = config.get('workOnSingleLine');
    const isCramReversed = config.get('cramReversed');
    const isOnlyCompleteRange = config.get('onlyCompleteRange');
    const isOneSelection = editor.selections.length === 1;
    const newSelections: Array<Selection> = [];

    editor.edit(builder => {
        for (const selection of editor.selections) {
            let start = selection.start;
            let end = selection.end;
            const active = selection.active;
            const isSelectionStartHasCursor = start.line === active.line && start.character === active.character;
            const isSingleLineSelection = start.line === end.line;

            if (isOneSelection && isSingleLineSelection && !isWorkOnSingleLine) return;

            const lines: Array<vscode.TextLine> = [];
            for (let i = start.line; i <= end.line; i++) {
                lines.push(editor.document.lineAt(i));
            }

            if (isReverse) {// Move left
                let isStartLineShifted = false;
                let isEndLineShifted = false;

                if (!isCramReversed && lines.some(line => line.text[0] !== ' ')) {
                    // vscode.window.showInformationMessage('Cram disabled!');// Dev notification
                    if (isSelectionStartHasCursor) {
                        [start, end] = [end, start];
                    }

                    newSelections.push(new Selection(start, end));// preserve old selection
                    continue;
                }

                if (lines.every(line => line.text[0] !== ' ') && end.character !== 0) {
                    // vscode.window.showInformationMessage('Nothing to cram!');// Dev notification
                    if (isSelectionStartHasCursor) {
                        [start, end] = [end, start];
                    }

                    newSelections.push(new Selection(start, end));
                    continue;
                }

                lines.forEach((line, i) => {
                    if (line.text[0] === ' ') {
                        if (i === 0) isStartLineShifted = true;
                        if (i === lines.length - 1) isEndLineShifted = true;

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

                if (isSingleLineSelection) {
                    if (newEndChar === -1) {
                        newStartChar = newStartChar + 1;
                    }
                    if (newStartChar === -1) {
                        newEndChar = newEndChar + 1;
                    }
                }

                if (newStartChar === -1) newStartChar = 0;
                if (newEndChar === -1) newEndChar = 0;

                newSelections.push(new Selection(
                    start.line, newStartChar,
                    end.line, newEndChar
                ));
            } else {// Move right
                if (isOnlyCompleteRange && !isCompleteRange(selection, lines[0], lines[lines.length - 1])) {
                    vscode.commands.executeCommand('type', { text: ' ' });

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
                    end.line, end.character + 1
                ));
            }
        }
    });

    editor.selections = newSelections;
}

export function activate(context: ExtensionContext) {
    const disposable1 = vscode.commands.registerCommand('extension.indentOneSpace', indentOneSpace.bind(null, false));
    const disposable2 = vscode.commands.registerCommand('extension.reverseIndentOneSpace', indentOneSpace.bind(null, true));

    context.subscriptions.push(disposable1, disposable2);
}

export function deactivate() { }