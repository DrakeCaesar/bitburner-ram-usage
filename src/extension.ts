import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
    console.log(
        'Congratulations, your extension "line-counter" is now active!'
    );

    let activeEditor = vscode.window.activeTextEditor;

    let lineCountDecoration: vscode.TextEditorDecorationType | undefined;

    function updateLineCount() {
        if (activeEditor && activeEditor.document.lineCount > 0) {
            const firstLine = activeEditor.document.lineAt(0);
            if (firstLine.text.startsWith('import { NS } from "@ns"')) {
                if (lineCountDecoration) {
                    activeEditor.setDecorations(lineCountDecoration, []); // Clear previous decoration
                }

                const lineCount = activeEditor.document.lineCount;
                const position = new vscode.Position(
                    0,
                    firstLine.range.end.character
                );
                lineCountDecoration =
                    vscode.window.createTextEditorDecorationType({
                        after: {
                            contentText: ` (${lineCount} lines)`,
                            fontStyle: "italic",
                            color: "gray",
                        },
                    });
                activeEditor.setDecorations(lineCountDecoration, [
                    new vscode.Range(position, position),
                ]);
            } else if (lineCountDecoration) {
                activeEditor.setDecorations(lineCountDecoration, []); // Clear decoration if the file does not match the required pattern
            }
        }
    }

    if (activeEditor) {
        updateLineCount();
    }

    vscode.window.onDidChangeActiveTextEditor(
        (editor) => {
            activeEditor = editor;
            if (editor) {
                updateLineCount();
            }
        },
        null,
        context.subscriptions
    );
	
	vscode.workspace.onDidOpenTextDocument(
		(document) => {
			activeEditor = vscode.window.activeTextEditor;
			if (activeEditor && activeEditor.document === document) {
				updateLineCount();
			}
		},
		null,
		context.subscriptions
	);

    vscode.workspace.onDidChangeTextDocument(
        (event) => {
            if (activeEditor && event.document === activeEditor.document) {
                updateLineCount();
            }
        },
        null,
        context.subscriptions
    );
}

export function deactivate() {}
