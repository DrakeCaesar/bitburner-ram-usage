import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "ram-counter" is now active!');

    let activeEditor = vscode.window.activeTextEditor;
    let ramCostDecoration: vscode.TextEditorDecorationType | undefined;

    interface FunctionRamCost {
        type: string;
        name: string;
        cost: number;
    }

    let ramCosts: FunctionRamCost[] = [];
    const baseCost = 1.6;

    async function parseRamCosts() {
        if (
            ramCosts.length === 0 &&
            activeEditor &&
            vscode.workspace.workspaceFolders
        ) {
            const rootFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
            const definitionsPath = path.join(
                rootFolder,
                "NetscriptDefinitions.d.ts"
            );

            if (fs.existsSync(definitionsPath)) {
                const fileContent = await fs.promises.readFile(
                    definitionsPath,
                    "utf-8"
                );
                const functionRegex =
                    /(?:RAM cost:|@remarks)[\s*]+(?:RAM cost:)? ?(\d+(?:\.\d+)?) ?GB[\s\S]+? (?:(\w+)\(.*\):|readonly (\w+))/g;

                let match;
                while ((match = functionRegex.exec(fileContent)) !== null) {
                    ramCosts.push({
                        type: match[2] ? "function" : "interface",
                        name: match[2] ?? match[3],
                        cost: parseFloat(match[1]),
                    });
                }
            }
            console.log(JSON.stringify(ramCosts, null, 2));
        }
    }

    async function updateRamUsage() {
        if (activeEditor && activeEditor.document.lineCount > 0) {
            const firstLine = activeEditor.document.lineAt(0);
            if (firstLine.text.startsWith('import { NS } from "@ns"')) {
                await parseRamCosts();

                let totalRamCost = baseCost;
                const documentText = activeEditor.document.getText();

                for (const ramCost of ramCosts) {
                    const regex = new RegExp(`\\b${ramCost.name}\\(`, "g");
                    const matches = documentText.match(regex);
                    if (matches) {
                        totalRamCost += ramCost.cost;
                        console.log(
                            `${matches[0]} : ${ramCost.name} : ${ramCost.cost}`
                        );
                    }
                }

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
                            contentText: ` (Total RAM usage: ${totalRamCost.toFixed(
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
                activeEditor.setDecorations(ramCostDecoration, []); // Clear decoration if the file does not match the required pattern
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
}

export function deactivate() {}
