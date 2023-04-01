import * as vscode from "vscode"
import * as fs from "fs"
import * as path from "path"
import * as ts from "typescript"
import { BaseServer } from "./Server/BaseServer"

const server = new BaseServer({ hostname: "", ip: "" })
let rootFsFolder: string

export function activate(context: vscode.ExtensionContext) {
   console.log('Congratulations, your extension "ram-counter" is now active!')

   let activeEditor = vscode.window.activeTextEditor
   let ramCostDecoration: vscode.TextEditorDecorationType | undefined
   if (vscode.workspace.workspaceFolders)
      rootFsFolder = vscode.workspace.workspaceFolders[0].uri.fsPath
   watchAndTranspile(
      path.join(rootFsFolder, "src"),
      path.join(rootFsFolder, "out"),
      compilerOptions
   )

   if (activeEditor) {
      updateRamUsage()
   }

   vscode.workspace.onDidOpenTextDocument(
      (document) => {
         activeEditor = vscode.window.activeTextEditor
         if (activeEditor && activeEditor.document === document) {
            updateRamUsage()
         }
      },
      null,
      context.subscriptions
   )

   vscode.window.onDidChangeActiveTextEditor(
      (editor) => {
         activeEditor = editor
         if (editor) {
            updateRamUsage()
         }
      },
      null,
      context.subscriptions
   )

   vscode.workspace.onDidChangeTextDocument(
      (event) => {
         if (activeEditor && activeEditor.document === event.document) {
            updateRamUsage()
         }
      },
      null,
      context.subscriptions
   )

   async function updateRamUsage() {
      const editor = vscode.window.activeTextEditor
      if (!editor) return
      const document = vscode.window.activeTextEditor?.document
      if (!document) return
      const ramUsagePath = path.join(rootFsFolder, "ramUsage.json")
      if (!fs.existsSync(ramUsagePath)) return

      const fileContent = await fs.promises.readFile(ramUsagePath, "utf-8")
      const ramUsageMap = new Map<string, number>(JSON.parse(fileContent))

      const VBPath = getViteburnerPath(editor.document.uri.fsPath, rootFsFolder)
      const ramCost = ramUsageMap.get(VBPath)
      let calculatedRamCost
      for (const script of server.scripts) {
         if (
            document.uri.path.replace(".ts", ".js").endsWith(script.filename)
         ) {
            script.updateRamUsage(server.scripts)
            calculatedRamCost = script.ramUsage
            break
         }
      }
      for (const script of server.scripts) script.updateRamUsage(server.scripts)

      console.log("sum:  " + ramCost)
      console.log("calc: " + calculatedRamCost)
      if (!ramCost && ramCostDecoration)
         editor.setDecorations(ramCostDecoration, [])
      if (!ramCost) return
      const firstLine = document.lineAt(0)

      if (ramCostDecoration) {
         editor.setDecorations(ramCostDecoration, []) // Clear previous decoration
      }

      const position = new vscode.Position(0, firstLine.range.end.character)
      ramCostDecoration = vscode.window.createTextEditorDecorationType({
         after: {
            contentText: ` (${ramCost.toFixed(2)} GB, ${(
               calculatedRamCost ?? 0
            ).toFixed(2)} GB)`,
            fontStyle: "italic",
            color: "green",
         },
      })
      editor.setDecorations(ramCostDecoration, [
         new vscode.Range(position, position),
      ])
   }
}

function getRelativePath(absPath: string, rootDir: string): string {
   const relPath = path.relative(rootDir, absPath).replace(/\\/g, "/")
   const relPathWithJs = relPath.replace(/\.ts$/, ".js")
   return relPathWithJs.includes("/") ? `/${relPathWithJs}` : relPathWithJs
}

function getViteburnerPath(absPath: string, rootDir: string): string {
   return path.relative(rootDir, absPath).replace(/\\/g, "/")
}

function transpileFile(filePath: string, options: ts.CompilerOptions): string {
   const fileContent = fs.readFileSync(filePath, "utf8")
   const result = ts.transpileModule(fileContent, {
      compilerOptions: options,
      fileName: filePath,
   })
   return result.outputText
      .replace(
         /(from ['"])(\.\/|\/src\/|\/)(.*?)(\.js|)(['"];?$)/gm,
         "$1/$3.js$5"
      )
      .replace("src", "out")
}

function transpileFolder(
   srcFolder: string,
   outFolder: string,
   options: ts.CompilerOptions
) {
   if (!fs.existsSync(outFolder)) {
      fs.mkdirSync(outFolder, { recursive: true })
   }
   const files = fs.readdirSync(srcFolder, {
      withFileTypes: true,
   })
   for (const file of files) {
      const filePath = path.join(srcFolder, file.name)
      const outFilePath = path.join(outFolder, file.name)
      if (file.isDirectory()) {
         transpileFolder(filePath, outFilePath, options)
      } else if (file.name.endsWith(".ts") || file.name.endsWith(".js")) {
         const jsContent = file.name.endsWith(".ts")
            ? transpileFile(filePath, options)
            : fs.readFileSync(filePath, "utf-8")
         fs.writeFileSync(
            outFilePath.replace(/\.ts$|\.js$/, ".js"),
            jsContent,
            "utf8"
         )
         const relPath = getRelativePath(
            outFilePath,
            path.join(rootFsFolder, "out")
         )
         server.writeToScriptFile(relPath, jsContent)
      }
   }
}

function watchAndTranspile(
   srcFolder: string,
   outFolder: string,
   options: ts.CompilerOptions
) {
   transpileFolder(srcFolder, outFolder, options)

   fs.watch(srcFolder, { recursive: true }, (eventType, filename) => {
      if (filename && (filename.endsWith(".ts") || filename.endsWith(".js"))) {
         const filePath = path.join(srcFolder, filename)
         const outFilePath = path.join(
            outFolder,
            filename.replace(/\.ts$|\.js$/, ".js")
         )
         const jsContent = filename.endsWith(".ts")
            ? transpileFile(filePath, options)
            : fs.readFileSync(filePath, "utf-8")
         fs.writeFileSync(outFilePath, jsContent, "utf8")
         const relPath = getRelativePath(
            outFilePath,
            path.join(rootFsFolder, "out")
         )
         server.writeToScriptFile(relPath, jsContent)
      }
   })
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
   moduleResolution: ts.ModuleResolutionKind.NodeNext,
   resolveJsonModule: true,
   skipLibCheck: true,
   outDir: "dist",
   paths: {
      "*": ["./src/*"],
      "@ns": ["./NetscriptDefinitions.d.ts"],
   },
}
