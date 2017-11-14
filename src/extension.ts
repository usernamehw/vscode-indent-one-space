'use strict';
import * as vscode from 'vscode';
import { ExtensionContext, Position, Range, Selection } from 'vscode';

function indentOneSpace(isReverse: boolean) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const config = vscode.workspace.getConfiguration('indentOneSpace');
    const isWorkOnSingleLine = config.get('workOnSingleLine');
    const isCramReversed = config.get('cramReversed');
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

            if (isReverse) {// Move left
                const lines: Array<vscode.TextLine> = [];
                let isStartLineShifted = false;
                let isEndLineShifted = false;

                for (let i = start.line; i <= end.line; i++) {
                    lines.push(editor.document.lineAt(i));
                }

                if (!isCramReversed && lines.some(line => line.text[0] !== ' ')) {
                    vscode.window.showInformationMessage('Cram disabled!');// Dev notification
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
    let disposable1 = vscode.commands.registerCommand('extension.indentOneSpace', indentOneSpace.bind(null, false));
    let disposable2 = vscode.commands.registerCommand('extension.reverseIndentOneSpace', indentOneSpace.bind(null, true));

    context.subscriptions.push(disposable1, disposable2);
}

export function deactivate() { }