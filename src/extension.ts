import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";
import { calculateRamUsage } from "./Script/RamCalculations";

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "ram-counter" is now active!');

    let activeEditor = vscode.window.activeTextEditor;
    let ramCostDecoration: vscode.TextEditorDecorationType | undefined;

    const ramUsageProvider = new RamUsageProvider();
    context.subscriptions.push(
        vscode.window.registerTreeDataProvider("ramUsageView", ramUsageProvider)
    );

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

                ramUsageProvider.refresh(ramUsageMap);

                const rootFolder =
                    vscode.workspace.workspaceFolders[0].uri.path + "/";

                const filePath = activeEditor.document.uri.path.replace(
                    rootFolder,
                    ""
                );
                const jsFilePath = filePath;

                const ramCost = ramUsageMap.get(jsFilePath);
                const sourceFileContent = fs.readFileSync(
                    path.join(rootFsFolder, filePath),
                    "utf8"
                );
                const sourceFile = ts.createSourceFile(
                    path.join(rootFsFolder, filePath),
                    sourceFileContent,
                    ts.ScriptTarget.Latest,
                    true
                );

                const ramCostCalc = calculateRamUsage(sourceFile.text, []);
                console.log(`Calculated: ${ramCostCalc}`);
                console.log(`Sum:        ${ramCost}`);

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

//export function deactivate() {}

class RamUsageItem extends vscode.TreeItem {
    constructor(label: string, ramCost: number) {
        super(label);
        this.description = `${ramCost.toFixed(2)} GB`;
    }
}

class RamUsageProvider implements vscode.TreeDataProvider<RamUsageItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<
        RamUsageItem | undefined | null | void
    > = new vscode.EventEmitter<RamUsageItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<
        RamUsageItem | undefined | null | void
    > = this._onDidChangeTreeData.event;

    private ramUsageMap: Map<string, number>;

    constructor() {
        this.ramUsageMap = new Map();
    }

    refresh(ramUsageMap: Map<string, number>): void {
        console.log("refreshing file view");
        this.ramUsageMap = ramUsageMap;
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: RamUsageItem): vscode.TreeItem {
        return element;
    }

    async getChildren(): Promise<RamUsageItem[]> {
        const items: RamUsageItem[] = [];

        for (const [filePath, ramCost] of this.ramUsageMap.entries()) {
            const fileName = path.basename(filePath);
            items.push(new RamUsageItem(fileName, ramCost));
            console.log(filePath);
            console.log(fileName);
            console.log(new RamUsageItem(fileName, ramCost));
        }

        return items;
    }
}
