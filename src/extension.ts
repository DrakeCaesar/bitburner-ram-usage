import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "ram-counter" is now active!');

    let activeEditor = vscode.window.activeTextEditor;
    let ramCostDecoration: vscode.TextEditorDecorationType | undefined;

    async function updateRamUsage() {
        if (
            vscode.workspace.workspaceFolders &&
            activeEditor &&
            activeEditor.document.lineCount > 0
        ) {
            const rootFsFolder =
                vscode.workspace.workspaceFolders[0].uri.fsPath;
            const ramUsagePath = path.join(rootFsFolder, "ramUsage.json");

            if (fs.existsSync(ramUsagePath)) {
                const fileContent = await fs.promises.readFile(
                    ramUsagePath,
                    "utf-8"
                );
                const ramUsageMap = new Map<string, number>(
                    JSON.parse(fileContent)
                );
                //console.log(fileContent);

                console.log(
                    JSON.stringify(Array.from(ramUsageMap.entries()), null, 2)
                );
                const rootFolder =
                    vscode.workspace.workspaceFolders[0].uri.path + "/";

                const filePath = activeEditor.document.uri.path.replace(
                    rootFolder,
                    ""
                );
                const jsFilePath = filePath;
                console.log(jsFilePath);
                console.log(rootFolder);

                const ramCost = ramUsageMap.get(jsFilePath);
                console.log(ramCost);

                if (ramCost) {
                    const firstLine = activeEditor.document.lineAt(0);

                    if (ramCostDecoration) {
                        activeEditor.setDecorations(ramCostDecoration, []); // Clear previous decoration
                    }

                    const position = new vscode.Position(
                        0,
                        firstLine.range.end.character
                    );
                    ramCostDecoration =
                        vscode.window.createTextEditorDecorationType({
                            after: {
                                contentText: ` (Total RAM usage: ${ramCost.toFixed(
                                    2
                                )} GB)`,
                                fontStyle: "italic",
                                color: "gray",
                            },
                        });
                    activeEditor.setDecorations(ramCostDecoration, [
                        new vscode.Range(position, position),
                    ]);
                } else if (ramCostDecoration) {
                    activeEditor.setDecorations(ramCostDecoration, []); // Clear decoration if the file does not have a RAM cost
                }
            }
        }
    }

    if (activeEditor) {
        updateRamUsage();
    }

    vscode.workspace.onDidOpenTextDocument(
        (document) => {
            activeEditor = vscode.window.activeTextEditor;
            if (activeEditor && activeEditor.document === document) {
                updateRamUsage();
            }
        },
        null,
        context.subscriptions
    );

    vscode.window.onDidChangeActiveTextEditor(
        (editor) => {
            activeEditor = editor;
            if (editor) {
                updateRamUsage();
            }
        },
        null,
        context.subscriptions
    );

    vscode.workspace.onDidChangeTextDocument(
        (event) => {
            if (activeEditor && activeEditor.document === event.document) {
                updateRamUsage();
            }
        },
        null,
        context.subscriptions
    );
}
