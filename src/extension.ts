import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";
import { BaseServer } from "./Server/BaseServer";
import { Script } from "./Script/Script";

const server = new BaseServer({ hostname: "", ip: "" });

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "ram-counter" is now active!');

    let activeEditor = vscode.window.activeTextEditor;
    let ramCostDecoration: vscode.TextEditorDecorationType | undefined;
    const rootFsFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
    watchAndTranspile(
        path.join(rootFsFolder, "src"),
        path.join(rootFsFolder, "out"),
        compilerOptions
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

function getRelativePath(absPath: string, rootDir: string): string {
    const relPath = path.relative(rootDir, absPath).replace(/\\/g, "/");
    const relPathWithJs = relPath.replace(/\.ts$/, ".js");
    return relPathWithJs.includes("/") ? `/${relPathWithJs}` : relPathWithJs;
}

function transpileFile(filePath: string, options: ts.CompilerOptions): string {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const result = ts.transpileModule(fileContent, {
        compilerOptions: options,
        fileName: filePath,
    });
    return result.outputText;
}

function transpileFolder(
    srcFolder: string,
    outFolder: string,
    options: ts.CompilerOptions
) {
    if (!fs.existsSync(outFolder)) {
        fs.mkdirSync(outFolder, { recursive: true });
    }
    const files = fs.readdirSync(srcFolder, {
        withFileTypes: true,
    });
    for (const file of files) {
        const filePath = path.join(srcFolder, file.name);
        const outFilePath = path.join(outFolder, file.name);
        if (file.isDirectory()) {
            transpileFolder(filePath, outFilePath, options);
        } else if (file.name.endsWith(".ts") || file.name.endsWith(".js")) {
            const jsContent = file.name.endsWith(".ts")
                ? transpileFile(filePath, options)
                : fs.readFileSync(filePath, "utf-8");
            fs.writeFileSync(
                outFilePath.replace(/\.ts$|\.js$/, ".js"),
                jsContent,
                "utf8"
            );
            const rootFsFolder =
                vscode.workspace.workspaceFolders[0].uri.fsPath;
            const relPath = getRelativePath(
                outFilePath,
                path.join(rootFsFolder, "out")
            );
            server.writeToScriptFile(relPath, jsContent);
        }
    }
}

function watchAndTranspile(
    srcFolder: string,
    outFolder: string,
    options: ts.CompilerOptions
) {
    transpileFolder(srcFolder, outFolder, options);

    fs.watch(srcFolder, { recursive: true }, (eventType, filename) => {
        if (
            filename &&
            (filename.endsWith(".ts") || filename.endsWith(".js"))
        ) {
            const filePath = path.join(srcFolder, filename);
            const outFilePath = path.join(
                outFolder,
                filename.replace(/\.ts$|\.js$/, ".js")
            );
            const jsContent = filename.endsWith(".ts")
                ? transpileFile(filePath, options)
                : fs.readFileSync(filePath, "utf-8");
            fs.writeFileSync(outFilePath, jsContent, "utf8");
            const rootFsFolder =
                vscode.workspace.workspaceFolders[0].uri.fsPath;
            const relPath = getRelativePath(
                outFilePath,
                path.join(rootFsFolder, "out")
            );
            server.writeToScriptFile(relPath, jsContent);
        }
    });
}
const compilerOptions: ts.CompilerOptions = {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ESNext,
    lib: ["ESNext", "DOM"],
    types: ["vite/client"],
    strict: true,
    allowJs: true,
    isolatedModules: true,
    esModuleInterop: true,
    baseUrl: ".",
    inlineSourceMap: true,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    resolveJsonModule: true,
    skipLibCheck: true,
    outDir: "dist",
    paths: {
        "@/*": ["./src/*"],
        "/src/*": ["./src/*"],
        "@ns": ["./NetscriptDefinitions.d.ts"],
    },
};
