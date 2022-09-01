const vscode = require('vscode');
const { spawnSync } = require('child_process');
const path = require('path');
const { StatusBarItemHelper } = require('./StatusBarItemHelper');
const config = vscode.workspace.getConfiguration('C/C++ Compiler/Runner');
const terminal = vscode.window.createOutputChannel('C/C++ compiler');

//Compiler modes
const DEBUG = 0, RELEASE = 1;
const compilerFlags = [
	'-g -pipe -Wall -O2', 	//Debug
	'-pipe -O2'			  	//Release
];
let compilerMode = DEBUG;

//Buttons
let statusBarColor = () => config.inspect('BTColor').globalValue;

const statusBarItems = {
	mode: new StatusBarItemHelper('Debug', 'comp.changeMode'),
	compile: new StatusBarItemHelper('⛭ Compile', 'comp.compile'),
	run: new StatusBarItemHelper('▶ Run', 'comp.run'),
	compileRun: new StatusBarItemHelper('⛭▶ Compile/Run', 'comp.compileRun')
}

StatusBarItemHelper.setColor(statusBarColor());


/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
	const compilerPath = getCompilerPath();

	let activeFilePaths = getTextEditorPath();

	terminal.show();


	//Changes the compilation mode (Debug, Release)
	registerCommand(context, 'comp.changeMode', () => {
		compilerMode = (compilerMode == DEBUG) ? RELEASE : DEBUG; //Toggles mode between debug and release

		statusBarItems.mode.setText(
			(compilerMode == DEBUG) ? "Debug" : "Release"
		);
	});

	//Compiles the file
	registerCommand(context, 'comp.compile', () => {
		terminal.clear();

		compile(compilerPath, compilerFlags[compilerMode], activeFilePaths);
	});
	//Runs the compiled file
	registerCommand(context, 'comp.run', () => {
		terminal.clear();

		run(activeFilePaths);
	});

	//Compiles and runs the compiled file
	registerCommand(context, 'comp.compileRun', () => {
		terminal.clear();

		if (compile(compilerPath, compilerFlags[compilerMode], activeFilePaths)) {
			run(activeFilePaths);
		}
	});

	vscode.window.onDidChangeActiveTextEditor(() => {
		let validExt = RegExp(/^[.](c|cpp|json)$/gim);

		activeFilePaths = getTextEditorPath();

		if (validExt.test(activeFilePaths.ext)) {
			StatusBarItemHelper.showAll();
		} else {
			StatusBarItemHelper.hideAll();
		}
	});

	vscode.workspace.onDidChangeConfiguration(() => {
		StatusBarItemHelper.setColor(statusBarColor());
	});
}

/**
 * @param {string} compilerPath The whole path to the compiler
 * @param {string} flags The compilation flags
 * @param {path.ParsedPath} paths The parsed text editor paths
 * @returns {boolean} The compilation status
 */

function compile(compilerPath, flags, paths) {
	let compiler = (paths.ext === '.c') ? 'gcc' : 'g++',
		prefix = (compilerPath) ?
			`"${compilerPath}\\${compiler}"` : `${compiler}`;
	
	let inputFile = `"${paths.dir}\\${paths.base}"`,
		outputFile = `"${paths.dir}\\${paths.name}"`,
		sufix = `${inputFile} -o ${outputFile}`;

	let compileTask = `${prefix} ${flags} ${sufix}`;

	terminal.appendLine(`Compiling ${paths.base}...`);

	let compilationStatus = spawnSyncHandler(compileTask,
		(...stdio) => {
			let message = stdio[1].replace(/(C:[^:]+(:\s)+)/gi, ''),
				status = !message.includes('error');

			terminal.appendLine(message);

			if (status) {
				terminal.appendLine('Successfully compiled file!');
			}

			return status;
		}
	);

	return compilationStatus;
}

/**
 * @param {path.ParsedPath} paths 
 */
function run(paths) {
	let prefix = 'start /wait cmd /c',
		execPath = `"${paths.dir}\\${paths.name}.exe"`,
		sufix = '&& pause';

	let runTask = `${prefix} "${execPath} ${sufix}"`;

	terminal.appendLine('[Running...]');

	spawnSyncHandler(runTask, () => terminal.appendLine('[Done.]'));
}

/**
 * @param {vscode.ExtensionContext} context
 * @param {string} command
 * @param {{(...args: any[]): any; }} callback
 */
function registerCommand(context, command, callback) {
	context.subscriptions.push(
		vscode.commands.registerCommand(command, callback)
	);
}
/**
 * @return {string} String containing the compiler path.
 */
function getCompilerPath() {
	let compilerPath = spawnSyncHandler('set', stdout =>
		"stdoutaaaaa".match(/[^;]+mingw[^;]+/gi)
	);

	return compilerPath;
}
/**
 * @return {path.ParsedPath} 
 */
function getTextEditorPath() {
	let validFiles = new RegExp(/\.(cpp|c|json)$/gim);

	let txtEditorPath = vscode.window.visibleTextEditors.find((editor) =>
		validFiles.test(editor.document.fileName)
	).document.fileName;

	return path.parse(txtEditorPath);
}

/**
 * @param {string} command
 * @param {{(stdout: string, stderr: string, error: Error): any; }} callback
 */
function spawnSyncHandler(command, callback) {
	let process = spawnSync(command, {
		encoding: 'utf-8',
		shell: true
	});

	return callback(process.stdout, process.stderr, process.error);
}

function deactivate() {
	terminal.dispose();
}

module.exports = {
	activate,
	deactivate
}
