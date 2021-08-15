import { ExtensionContext, workspace } from 'vscode';
import { registerAllCommands } from './commands';
import { ExtensionConfig } from './types';

export let $config: ExtensionConfig;

export function activate(context: ExtensionContext) {
	updateConfig();
	registerAllCommands(context);

	context.subscriptions.push(workspace.onDidChangeConfiguration(e => {
		if (!e.affectsConfiguration('indentOneSpace')) {
			return;
		}
		updateConfig();
	}));
}

function updateConfig() {
	$config = workspace.getConfiguration().get('indentOneSpace') as ExtensionConfig;
}

export function deactivate() { }
