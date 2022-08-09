const vscode = require('vscode');
const { exec } = require('child_process');
const { code, output } = require('./fn');

/**
 * @param {vscode.ExtensionContext} context
 */

//Compiler modes
const DEBUG = 0, RELEASE = 1;

function activate(context) {
	//=======================================Setup=======================================//	
	output.show();

	//Selected compiler mode (DEBUG, RELEASE)
	let mode = DEBUG;
	//Compiler flags
	const flags = [ '-g -pipe -Wall -O2', //Debug
					'-pipe -O2' //Release
				];
 
	let gnuPath = null; //Compiler path (GCC,G++)
	exec('cmd /c set', (error,stdout) => {
		for(let envPath of stdout.toLowerCase().split(';')) 
			gnuPath = (envPath.includes("mingw")) ? envPath : gnuPath;
	});
	
	//Buttons
	const BT = {
		compile: vscode.window.createStatusBarItem(1, 0),
		run: vscode.window.createStatusBarItem(1, 0),
		compileRun: vscode.window.createStatusBarItem(1, 0),
		mode: vscode.window.createStatusBarItem(1, 0)
	}
	code.createButtons(BT, mode);

	//======================================Commands======================================//
	//Changes the compilation mode (Debug, Release)
	context.subscriptions.push(vscode.commands.registerCommand('comp.changeMode', function(){
		mode = (mode == DEBUG) ? RELEASE : DEBUG; //Toggles mode between debug and release

		code.createButtons(BT, mode);
	}));

	//Compiles the code
	context.subscriptions.push(vscode.commands.registerCommand('comp.compile', function(){
		output.clear();
		code.compile(gnuPath, flags[mode]);
	}));

	//Runs the code
	context.subscriptions.push(vscode.commands.registerCommand('comp.run', function(){
		output.clear();
		code.run();
	}));

	//Compiles and runs the code
	context.subscriptions.push(vscode.commands.registerCommand('comp.compileRun', function (){
		output.clear();
		code.compileAndRun(gnuPath, flags[mode]);
	}));	
}

function deactivate() {

}

module.exports = {
	activate,
	deactivate
}
