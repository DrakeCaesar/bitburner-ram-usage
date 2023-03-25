import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { BaseServer } from "./Server/BaseServer";

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
            const server = new BaseServer({ hostname: "", ip: "" });
            const rootFsFolder =
                vscode.workspace.workspaceFolders[0].uri.fsPath;
            const ramUsagePath = path.join(rootFsFolder, "ramUsage.json");

            function readFilesRecursive(dir: string, parentPath = "") {
                const files = fs.readdirSync(dir, {
                    withFileTypes: true,
                });
                for (const file of files) {
                    const filePath = path.join(dir, file.name);
                    const relativePath = path.join(parentPath, file.name);
                    if (file.isDirectory()) {
                        readFilesRecursive(filePath, relativePath);
                    } else if (
                        file.name.endsWith(".js") ||
                        file.name.endsWith(".ts")
                    ) {
                        const sourcePath = filePath.endsWith(".ts")
                            ? filePath
                                  .replace("src", "dist\\src")
                                  .replace(".ts", ".js")
                            : filePath;
                        const sourceFileContent = fs.readFileSync(
                            sourcePath,
                            "utf-8"
                        );
                        if (relativePath.includes("\\")) {
                            server.writeToScriptFile(
                                "/" +
                                    relativePath
                                        .replace(".ts", ".js")
                                        .replace("\\", "/"),
                                sourceFileContent
                            );
                        } else {
                            server.writeToScriptFile(
                                relativePath.replace(".ts", ".js"),
                                sourceFileContent
                            );
                        }
                    }
                }
            }

            readFilesRecursive(path.join(rootFsFolder, "src"));
            if (fs.existsSync(ramUsagePath)) {
                const fileContent = await fs.promises.readFile(
                    ramUsagePath,
                    "utf-8"
                );
                const ramUsageMap = new Map<string, number>(
                    JSON.parse(fileContent)
                );
                //console.log(fileContent);

                // console.log(
                //     JSON.stringify(Array.from(ramUsageMap.entries()), null, 2)
                // );
                const rootFolder =
                    vscode.workspace.workspaceFolders[0].uri.path + "/";

                const filePath = activeEditor.document.uri.path.replace(
                    rootFolder,
                    ""
                );
                const jsFilePath = filePath;
                // console.log(jsFilePath);
                // console.log(rootFolder);

                const ramCost = ramUsageMap.get(jsFilePath);

                // const calculatedRamCost = calculateRamUsage(
                //     sourceFileContent,
                //     []
                // );
                let calculatedRamCost;
                for (const script of server.scripts) {
                    if (
                        activeEditor.document.uri.path
                            .replace(".ts", ".js")
                            .includes(script.filename)
                    ) {
                        script.updateRamUsage(server.scripts);
                        calculatedRamCost = script.ramUsage;
                        break;
                    }
                }

                console.log("sum:  " + ramCost);
                console.log("calc: " + calculatedRamCost);

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
                                contentText: ` (${ramCost.toFixed(2)} GB, ${(
                                    calculatedRamCost ?? 0
                                ).toFixed(2)} GB)`,
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

//export function deactivate() {}
