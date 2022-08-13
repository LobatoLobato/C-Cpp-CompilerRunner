const vscode = require('vscode');
const { exec, spawnSync, execSync } = require('child_process');
const path = require('path');
/**
 * @param {vscode.ExtensionContext} context
 */

//Compiler modes
const DEBUG = 0, RELEASE = 1;
const output = vscode.window.createOutputChannel('C/C++ compiler');
output.show();

function activate(context) {
	//=======================================Setup=======================================//		
	//Compiler path (GCC,G++)
	let gnuPath = spawnSync('set', { encoding: 'utf-8', shell: true }).stdout
		.split(';')
		.find(path =>
			path.toLowerCase().includes("mingw")
		);

	let paths = path.parse(vscode.window.activeTextEditor.document.fileName);
	
	//Selected compiler mode (DEBUG, RELEASE)
	let mode = DEBUG;

	//Compiler flags	 //Debug		  //Release
	const flags = ['-g -pipe -Wall -O2', '-pipe -O2'];
	
	//Buttons
	const BT = {
		mode: vscode.window.createStatusBarItem(1, 0),
		compile: vscode.window.createStatusBarItem(1, 0),
		run: vscode.window.createStatusBarItem(1, 0),
		compileRun: vscode.window.createStatusBarItem(1, 0)
	}

	const color = vscode.workspace.getConfiguration('C/C++ Compiler').get('BTColor');
	sla(BT.mode, 'Debug', color, 'comp.changeMode');
	sla(BT.compile, '⛭ Compile', color, 'comp.compile');
	sla(BT.run, '▶ Run', color, 'comp.run');
	sla(BT.compileRun, '⛭▶ Compile/Run', color, 'comp.compileRun');

	//======================================Commands======================================//
	//Changes the compilation mode (Debug, Release)
	context.subscriptions.push(vscode.commands.registerCommand('comp.changeMode', () => {
		mode = (mode == DEBUG) ? RELEASE : DEBUG; //Toggles mode between debug and release

		switch (mode) {
			case DEBUG: BT.mode.text = "Debug";
				break;
			case RELEASE: BT.mode.text = "Release";
				break;
		}
	}));

	//Compiles the code
	context.subscriptions.push(vscode.commands.registerCommand('comp.compile', () => {
		output.clear();
		compile(gnuPath, flags[mode], paths);
	}));

	//Runs the code
	context.subscriptions.push(vscode.commands.registerCommand('comp.run', () => {
		output.clear();
		run(paths);
	}));

	//Compiles and runs the code
	context.subscriptions.push(vscode.commands.registerCommand('comp.compileRun', () => {
		output.clear();

		if (compile(gnuPath, flags[mode], paths)) {
			run(paths);
		}
	}));

	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => {
		paths = path.parse(vscode.window.activeTextEditor.document.fileName);
	}));
}

function compile(gnuPath, flags, paths) {
	let sufix = `\"${paths.dir}\\${paths.base}\" -o \"${paths.dir}\\${paths.name}\"`,
		prefix,
		compileTask;
		
	switch (paths.ext) {
		case ".c":
			prefix = (gnuPath != null) ? `\"${gnuPath}\\gcc\"` : 'gcc';
			break;
		case ".cpp":
			prefix = (gnuPath != null) ? `\"${gnuPath}\\g++\"` : 'g++';
			break;
	}
	compileTask = `${prefix} ${flags} ${sufix}`;

	output.appendLine(`Compiling ${paths.base}...`);

	let message = spawnSync(compileTask, { encoding: 'utf-8', shell: true }).stderr;
	for (let line of message.split("\n"))
		output.appendLine(line.substring(line.indexOf(paths.base)));

	let compilationSuccessful = message.includes(paths.base) && !message.includes('error');

	output.appendLine((compilationSuccessful) ? 'Succesfully compiled file.' : 'Error when compiling file.');

	return compilationSuccessful;
}


function run(paths) {
	let runTask = `start /wait cmd /c \"\"${paths.dir}\\${paths.name}.exe\" && pause\"`;

	output.appendLine('[Running...]');

	exec(runTask, () => output.appendLine('[Done.]'));
}

function sla(bt, txt, clr, cmd) {
	bt.text = txt;
	bt.color = clr;
	bt.command = cmd;
	bt.show();
}

function deactivate() {

}

module.exports = {
	activate,
	deactivate
}
