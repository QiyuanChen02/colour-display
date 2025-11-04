import path from 'node:path';
import * as vscode from 'vscode';
import { getWebviewContent } from './getWebviewContent';

let currentPanel: vscode.WebviewPanel | undefined;

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "colour-display" is now active!');
	
	const disposable = vscode.commands.registerCommand(
		"colour-display.open",
		async () => {
			if (currentPanel) {
				currentPanel.reveal(vscode.ViewColumn.One);
				return;
			}

			currentPanel = vscode.window.createWebviewPanel(
				"colourDisplay",
				"Colour Display",
				vscode.ViewColumn.One,
				{
					enableScripts: true,
					retainContextWhenHidden: true,
					localResourceRoots: [
						vscode.Uri.file(
							path.join(context.extensionPath, "webview", "dist"),
						),
						vscode.Uri.file(
							path.join(
								context.extensionPath,
								"node_modules",
								"@vscode",
								"codicons",
								"dist",
							),
						),
					],
				},
			);

			currentPanel.webview.html = await getWebviewContent(
				context,
				currentPanel.webview,
			);

			currentPanel.onDidDispose(
				() => {
					currentPanel = undefined;
				},
				null,
				context.subscriptions,
			);
		},
	);

	context.subscriptions.push(disposable);
}

export function deactivate() {}
