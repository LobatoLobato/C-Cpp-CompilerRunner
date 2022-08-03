const vscode = require('vscode');
const path = require('path');
const { exec } = require('child_process');
const { code, output } = require('./fn');
/**
 * @param {vscode.ExtensionContext} context
 */
//Modes
const DEBUG = 0, RELEASE = 1;

//Compiler flags
//Buttons
const BT = {
	compile: vscode.window.createStatusBarItem(1, 0),
	run: vscode.window.createStatusBarItem(1, 0),
	compileRun: vscode.window.createStatusBarItem(1, 0),
	reload: vscode.window.createStatusBarItem(1, 0),
	mode: vscode.window.createStatusBarItem(1, 0)
}
//debugFlags, //Selected compiler flags
let mode = DEBUG, //Selected compiler mode (DEBUG, RELEASE)
	flags = [ //Selected compiler flags
		'-g -pipe -Wall -O2', //Debug
		'-pipe -O2' //Release
	];
let gnuPath = null; //Compiler path

//All paths to the active text editor
let paths = path.parse(vscode.window.activeTextEditor.document.fileName);

function activate(context) {
	//Shows the output channel
	output.show();
	//Gets the path to the compiler
	find_gnuPath();
	
	//Creates buttons
	code.createButtons(BT, mode);

	//Reloads buttons (color change)
	let reloadBt = vscode.commands.registerCommand('comp.reloadBT', function(){
		code.createButtons(BT, mode);
	});context.subscriptions.push(reloadBt);

	//Changes the compilation mode (Debug, Release)
	let modeBt = vscode.commands.registerCommand('comp.changeMode', function(){
		mode = (mode == DEBUG) ? RELEASE : DEBUG; //Toggles mode between debug and release

		code.createButtons(BT, mode);
	});context.subscriptions.push(modeBt);

	//Compiles the code
	let compile = vscode.commands.registerCommand('comp.compile', function(){
		//Finds the active text editor's path
		paths = path.parse(vscode.window.activeTextEditor.document.fileName);

		code.compile(paths, gnuPath, false, flags[mode]);
	});context.subscriptions.push(compile);

	//Runs the code
	let run = vscode.commands.registerCommand('comp.run', function(){
		//Finds the active text editor's path
		paths = path.parse(vscode.window.activeTextEditor.document.fileName);

		code.run(paths, true);
	});context.subscriptions.push(run);

	//Compiles and runs the code
	let compileRun = vscode.commands.registerCommand('comp.compileRun', function (){
		//Finds the active text editor's path
		paths = path.parse(vscode.window.activeTextEditor.document.fileName);
		
		code.compileAndRun(paths, gnuPath, flags[mode]);
	});context.subscriptions.push(compileRun);	
}

//Finds the compiler path on windows (gcc/g++)
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

// this method is called when your extension is deactivated
function deactivate() {

}

module.exports = {
	activate,
	deactivate
}
