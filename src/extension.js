const vscode = require('vscode');
const path = require('path');
const { exec } = require('child_process');
const { code, output } = require('./fn');
const DEBUG = 0, RELEASE = 1;
const debugFlags = '-g -pipe -Wall -O2',
	  releaseFlags = '-pipe -O2';
/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
	output.show();
	
	let mode = DEBUG,
		flags = debugFlags;

	let gnuPath = "";//Path to the compiler
	find_gnuPath();//Gets the path to the compiler
	//Path to the active text editor
	let paths = path.parse(vscode.window.activeTextEditor.document.fileName);

	//Button object array
	const BT = {
		compile: vscode.window.createStatusBarItem(1, 0),
		run: vscode.window.createStatusBarItem(1, 0),
		compileRun: vscode.window.createStatusBarItem(1, 0),
		reload: vscode.window.createStatusBarItem(1, 0),
		mode: vscode.window.createStatusBarItem(1, 0)
	}

	//Creates buttons
	code.createButtons(BT, mode);

	//Reloads buttons (color change)
	let reloadBt = vscode.commands.registerCommand('comp.reloadBT', function(){
		code.createButtons(BT, mode);
	});context.subscriptions.push(reloadBt);

	//Changes the compilation mode (Debug, Release)
	let modeBt = vscode.commands.registerCommand('comp.changeMode', function(){
		mode = (mode == DEBUG) ? RELEASE : DEBUG;

		if(mode == DEBUG) flags = debugFlags;
		else if(mode == RELEASE) flags = releaseFlags;

		code.createButtons(BT, mode);
	});context.subscriptions.push(modeBt);

	//Compiles the code
	let compile = vscode.commands.registerCommand('comp.compile', function(){
		paths = path.parse(vscode.window.activeTextEditor.document.fileName);

		code.compile(paths, gnuPath, false, flags);
	});context.subscriptions.push(compile);

	//Runs the code
	let run = vscode.commands.registerCommand('comp.run', function(){
		paths = path.parse(vscode.window.activeTextEditor.document.fileName);

		code.run(paths, true);
	});context.subscriptions.push(run);

	//Compiles and runs the code
	let compileRun = vscode.commands.registerCommand('comp.compileRun', function (){
		paths = path.parse(vscode.window.activeTextEditor.document.fileName);
		
		code.compileAndRun(paths, gnuPath, flags);
	});context.subscriptions.push(compileRun);

	//Finds the compiler path
	function find_gnuPath(){
		exec('cmd /c set', (error,stdout) => {
			var pathsArray = stdout.split('\n');
			var auxArray;

			for(var i =0;i < pathsArray.length;i++){
				if(pathsArray[i].search("MinGW") != -1 || pathsArray[i].search("mingw") != -1){
					auxArray = pathsArray[i].split(';');
					break;
				}
			}
			for(var i = 1;i<auxArray.length;i++){
				if(auxArray[i].search("MinGW") != -1 || pathsArray[i].search("mingw") != -1){
					gnuPath = auxArray[i];
					return;
				}
			}
			gnuPath = null;
		});
	}
}

	

// this method is called when your extension is deactivated
function deactivate() {

}

module.exports = {
	activate,
	deactivate
}
