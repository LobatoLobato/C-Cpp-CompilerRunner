const vscode = require('vscode');
const { exec, spawnSync } = require('child_process');
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

//Output Terminal

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
		activeFilePaths = getTextEditorPath();
	});

	vscode.workspace.onDidChangeConfiguration(() => {
		StatusBarItemHelper.setColor(statusBarColor());
	});
}

function compile(compilerPath, flags, paths) {
	let sufix = `\"${paths.dir}\\${paths.base}\" -o \"${paths.dir}\\${paths.name}\"`,
		compiler = (paths.ext === ".c") ? 'gcc' : 'g++',
		prefix = `"${compilerPath}${compiler}"`;
	let compileTask = `${prefix} ${flags} ${sufix}`;

	terminal.appendLine(`Compiling ${paths.base}...`);

	let compilation = spawnSyncHandler(compileTask, (stdout, stderr) => {
		let message = stderr.replace(/(C:[^:]+(:\s)+)/gi, ''),
			status = !message.includes('error');

		return { message, status };
	});

	terminal.appendLine(compilation.message);

	if (compilation.status == true)
		terminal.appendLine('Succesfully compiled file!');

	return compilation.status;
}


function run(paths) {
	let prefix = 'start /wait cmd /c',
		execPath = `${paths.dir}\\${paths.name}.exe`,
		sufix = '&& pause';
	let runTask = `${prefix} ""${execPath}" ${sufix}"`;

	terminal.appendLine('[Running...]');

	exec(runTask, () => terminal.appendLine('[Done.]'));
}

function registerCommand(context, command, callback) {
	context.subscriptions.push(vscode.commands.registerCommand(command, callback));
}

function getCompilerPath() {
	let compilerPath = spawnSyncHandler('set', stdout => {
		let path = stdout.match(/[^;]+mingw[^;]+/gi);

		if (path == null) {
			return '';
		}

		return path + '\\';
	});
	return compilerPath;
}

function getTextEditorPath() {
	return path.parse(vscode.window.activeTextEditor.document.fileName);
}

function spawnSyncHandler(command, callback) {
	let process = spawnSync(command, { encoding: 'utf-8', shell: true });
	return callback(process.stdout, process.stderr, process.error);
}

function deactivate() {
	terminal.dispose();
}

module.exports = {
	activate,
	deactivate
}
