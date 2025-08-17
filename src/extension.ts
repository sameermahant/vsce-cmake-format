import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

const execFileAsync = promisify(execFile);

const extensionPublisher = 'intellect-ind-in';
const extensionId = 'cmake-formatter';
const extensionFullId = `${extensionPublisher}.${extensionId}`;
const configNamespace = `${extensionId}`;

let isFormatting = false;
const formattingDocuments = new Set<string>();

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
    let timer: NodeJS.Timeout;
    return ((...args: any[]) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    }) as T;
}

function isCMakeFile(fileName: string): boolean {
    return path.extname(fileName) === '.cmake' || path.basename(fileName) === 'CMakeLists.txt';
}

function getConfig() {
    const config = vscode.workspace.getConfiguration(configNamespace);
    return {
        formatOnSave: config.get<boolean>('formatOnSave', false),
        executablePath: config.get<string>('executablePath'),
        arguments: config.get<string[]>('arguments', []),
        neededVersion: config.get<string>('neededVersion'),
        logLevel: config.get<string>('logLevel', 'info')
    };
}

function log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
    const { logLevel } = getConfig();
    const levels = ['error', 'warn', 'info'];
    if (levels.indexOf(level) <= levels.indexOf(logLevel)) {
        console[level](message);
    }
}

function validateExecutablePath(executablePath: string): boolean {
    if (!executablePath || !fs.existsSync(executablePath)) {
        vscode.window.showErrorMessage(`Invalid cmake-format path: "${executablePath}". Please check your settings.`);
        return false;
    }
    return true;
}

function getFullDocumentRange(doc: vscode.TextDocument): vscode.Range {
    return new vscode.Range(doc.positionAt(0), doc.positionAt(doc.getText().length));
}

async function getCMakeFormatVersion(executablePath: string): Promise<string | null> {
    try {
        const { stdout } = await execFileAsync(executablePath, ['--version']);
        log(`Raw version output: "${stdout}"`, 'info');
        return stdout.trim();
    } catch (error) {
        log('Failed to get cmake-format version: ' + error, 'error');
        return null;
    }
}

async function checkVersionMismatch(executablePath: string, neededVersion?: string): Promise<void> {
    const version = await getCMakeFormatVersion(executablePath);
    log(`cmake-format version: ${version}`, 'info');

    if (neededVersion && version !== neededVersion) {
        vscode.window.showWarningMessage(`cmake-format version mismatch: expected ${neededVersion}, got ${version}`);
    }
}

async function runCMakeFormat(
    doc: vscode.TextDocument,
    args: string[],
    executablePath: string
): Promise<string> {
    try {
        const { stdout } = await execFileAsync(executablePath, [...args, doc.fileName]);
        return stdout;
    } catch (error: any) {
        vscode.window.showErrorMessage(`cmake-format error: ${error.stderr || error.message}`);
        throw error;
    }
}

async function formatDocument(doc: vscode.TextDocument, saveAfter: boolean): Promise<void> {
    if (isFormatting || formattingDocuments.has(doc.uri.fsPath)) { return; }

    isFormatting = true;
    formattingDocuments.add(doc.uri.fsPath);

    try {
        if (!isCMakeFile(doc.fileName)) {
            vscode.window.showErrorMessage('Not a CMake file.');
            return;
        }

        const config = getConfig();
        const { executablePath, arguments: args, neededVersion } = config;

        if (!executablePath || !validateExecutablePath(executablePath)) {
            return;
        }

        await checkVersionMismatch(executablePath, neededVersion);

        const formatted = await runCMakeFormat(doc, args, executablePath);
        const editor = await vscode.window.showTextDocument(doc);
        await editor.edit(editBuilder => {
            editBuilder.replace(getFullDocumentRange(doc), formatted);
        });

        if (saveAfter) {
            await doc.save();
        }

        log(`Applied cmake-format to: ${doc.uri.fsPath}`, 'info');
    } catch (error) {
        log('Failed to apply cmake-format: ' + error, 'error');
    } finally {
        formattingDocuments.delete(doc.uri.fsPath);
        isFormatting = false;
    }
}

const debouncedFormat = debounce((doc: vscode.TextDocument) => formatDocument(doc, true), 300);

export function activate(context: vscode.ExtensionContext) {
    log(`[${extensionFullId}] Extension is now active.`, 'info');

    const applyCommandId = `${extensionId}.applyCmakeFormat`;
    const toggleCommandId = `${extensionId}.toggleFormatOnSave`;

    const applyFormatCommand = vscode.commands.registerCommand(applyCommandId, async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found.');
            return;
        }
        await formatDocument(editor.document, false);
    });
    context.subscriptions.push(applyFormatCommand);

    const toggleFormatOnSave = vscode.commands.registerCommand(toggleCommandId, async () => {
        const config = vscode.workspace.getConfiguration(configNamespace);
        const current = config.get<boolean>('formatOnSave', false);
        await config.update('formatOnSave', !current, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`cmake-format formatOnSave is now ${!current ? 'enabled' : 'disabled'}.`);
    });
    context.subscriptions.push(toggleFormatOnSave);

    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            { scheme: 'file', pattern: '**/{CMakeLists.txt,*.cmake}' },
            {
                async provideDocumentFormattingEdits(document: vscode.TextDocument): Promise<vscode.TextEdit[]> {
                    const config = getConfig();
                    const { executablePath, arguments: args } = config;

                    if (!executablePath || !validateExecutablePath(executablePath)) {
                        return [];
                    }

                    try {
                        const { stdout } = await execFileAsync(executablePath, [...args, document.fileName]);
                        return [vscode.TextEdit.replace(getFullDocumentRange(document), stdout)];
                    } catch (error: any) {
                        vscode.window.showErrorMessage(`cmake-format error: ${error.stderr || error.message}`);
                        return [];
                    }
                }
            }
        )
    );

    vscode.workspace.onDidSaveTextDocument(doc => {
        if (formattingDocuments.has(doc.uri.fsPath)) {
            log(`Skipping format-on-save for ${doc.fileName} (already formatting)`, 'info');
            return;
        }

        log(`onDidSaveTextDocument triggered for ${doc.fileName}`, 'info');

        const config = getConfig();
        const { formatOnSave, executablePath } = config;

        if (!formatOnSave || !isCMakeFile(doc.fileName) || !executablePath || !validateExecutablePath(executablePath)) {
            return;
        }

        debouncedFormat(doc);
    });
}

export function deactivate() { }
