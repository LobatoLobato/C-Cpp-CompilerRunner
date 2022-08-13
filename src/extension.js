const vscode = require('vscode');
const { exec, spawnSync } = require('child_process');
const path = require('path');
const { StatusBarItemHelper } = require('./StatusBarItemHelper');

/**
 * @param {vscode.ExtensionContext} context
 */

//Compiler modes
const DEBUG = 0, RELEASE = 1;
const compilerFlags = [
	'-g -pipe -Wall -O2', 	//Debug
	'-pipe -O2'			  	//Release
];
let compilerMode = DEBUG;

//Buttons
const btColor = vscode.workspace.getConfiguration('C/C++ Compiler').get('BTColor');
const BT = {
	mode: new StatusBarItemHelper('Debug', btColor, 'comp.changeMode'),
	compile: new StatusBarItemHelper('⛭ Compile', btColor, 'comp.compile'),
	run: new StatusBarItemHelper('▶ Run', btColor, 'comp.run'),
	compileRun: new StatusBarItemHelper('⛭▶ Compile/Run', btColor, 'comp.compileRun')
}

//Output Console
const console = vscode.window.createOutputChannel('C/C++ compiler');
console.show();

function activate(context) {
	const compilerPath = spawnSync('set', { encoding: 'utf-8', shell: true })
		.stdout
		.split(';')
		.find(path =>
			path.toLowerCase().includes("mingw")
		);
	let activeFilePaths = path.parse(vscode.window.activeTextEditor.document.fileName);



	//Changes the compilation mode (Debug, Release)
	context.subscriptions.push(
		vscode.commands.registerCommand('comp.changeMode', () => {
			compilerMode = (compilerMode == DEBUG) ? RELEASE : DEBUG; //Toggles mode between debug and release

			switch (compilerMode) {
				case DEBUG: BT.mode.setText("Debug");
					break;
				case RELEASE: BT.mode.setText("Release");
					break;
			}
		})
	);

	//Compiles the code
	context.subscriptions.push(
		vscode.commands.registerCommand('comp.compile', () => {
			console.clear();
			compile(compilerPath, compilerFlags[compilerMode], activeFilePaths);
		})
	);

	//Runs the code
	context.subscriptions.push(
		vscode.commands.registerCommand('comp.run', () => {
			console.clear();
			run(activeFilePaths);
		})
	);

	//Compiles and runs the code
	context.subscriptions.push(
		vscode.commands.registerCommand('comp.compileRun', () => {
			console.clear();
			if (compile(compilerPath, compilerFlags[compilerMode], activeFilePaths)) {
				run(activeFilePaths);
			}
		})
	);

	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(() => {
			activeFilePaths = path.parse(vscode.window.activeTextEditor.document.fileName);
		})
	);
}

function compile(compilerPath, flags, paths) {
	let sufix = `\"${paths.dir}\\${paths.base}\" -o \"${paths.dir}\\${paths.name}\"`,
		prefix,
		compileTask;

	switch (paths.ext) {
		case ".c":
			prefix = (compilerPath) ? `\"${compilerPath}\\gcc\"` : 'gcc';
			break;
		case ".cpp":
			prefix = (compilerPath) ? `\"${compilerPath}\\g++\"` : 'g++';
			break;
	}

	compileTask = `${prefix} ${flags} ${sufix}`;

	console.appendLine(`Compiling ${paths.base}...`);

	let message = spawnSync(compileTask, { encoding: 'utf-8', shell: true }).stderr;
	for (let line of message.split("\n"))
		console.appendLine(line.substring(line.indexOf(paths.base)));

	let compilationStatus = message.includes(paths.base) && !message.includes('error');

	console.appendLine(
		(compilationStatus == true ? 'Succesfully compiled file.' : 'Error when compiling file.')
	);

	return compilationStatus;
}


function run(paths) {
	let runTask = `start /wait cmd /c \"\"${paths.dir}\\${paths.name}.exe\" && pause\"`;

	console.appendLine('[Running...]');

	exec(runTask, () => console.appendLine('[Done.]'));
}

function deactivate() {
	console.dispose();
}

module.exports = {
	activate,
	deactivate
}
