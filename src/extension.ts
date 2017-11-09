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
            const start = selection.start;
            let end = selection.end;
            const isSingleLineSelection = start.line === end.line;

            if (isOneSelection && isSingleLineSelection && !isWorkOnSingleLine) return;

            if (isReverse && end.character === 0) {
                end = new Position(end.line, 1);
            }

            const range = new Range(
                new Position(start.line, 0),
                new Position(end.line, end.character)
            );

            const lines = editor.document.getText(range)
                .split('\n');

            if (isReverse) {
                // Move left
                if (!isCramReversed && lines.some(line => line[0] !== ' ')) {
                    // vscode.window.showInformationMessage('Cram disabled!');// Dev notification
                    newSelections.push(new Selection(start, end));// preserve old selection
                    continue;
                }
                // if (lines.every(line => line[0] !== ' ') && end.character !== 0) {
                //     vscode.window.showInformationMessage('Nothing to cram!');// Dev notification
                // }

                const shiftedLines = lines.map(line => {
                    if (!line.length) return '';// when cursor on 0 character

                    return (line[0] === ' ' ? '' : line[0]) + line.slice(1);
                });

                builder.replace(range, shiftedLines.join('\n'));

                const isStartMoved = lines[0].length !== shiftedLines[0].length;
                const isEndMoved = lines[lines.length - 1].length !== shiftedLines[shiftedLines.length - 1].length;

                let newStartChar = isStartMoved ? start.character - 1 : start.character;
                let newEndChar = isEndMoved ? end.character - 1 : end.character;

                if (newStartChar === -1) {// when selection hits gutter preserve old selection
                    newStartChar = 0;
                    newEndChar = end.character;
                }

                newSelections.push(new Selection(
                    start.line, newStartChar,
                    end.line, newEndChar
                ));
            } else {
                // Move right
                builder.replace(range, lines.map(line => ` ${line}`).join('\n'));

                newSelections.push(new Selection(
                    start.line, start.character + 1,
                    end.line, end.character + 1
                ));
            }
        }
    });

    console.log(newSelections, newSelections.length, newSelections.length === 1);

    editor.selections = newSelections;
}

export function activate(context: ExtensionContext) {
    let disposable1 = vscode.commands.registerCommand('extension.indentOneSpace', indentOneSpace.bind(null, false));
    let disposable2 = vscode.commands.registerCommand('extension.reverseIndentOneSpace', indentOneSpace.bind(null, true));

    context.subscriptions.push(disposable1, disposable2);
}

export function deactivate() {
}