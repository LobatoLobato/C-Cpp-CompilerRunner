const vscode = require('vscode');
const { exec } = require('child_process');
const path = require('path');
const DEBUG = 0, RELEASE = 1;
const output = vscode.window.createOutputChannel('C/C++ compiler');

const code = {
    compile: function(gnuPath, flags, run = false) {
        let paths = path.parse(vscode.window.activeTextEditor.document.fileName);//Finds the active text editor's path

        let sufix = `\"${paths.dir}\\${paths.base}\" -o \"${paths.dir}\\${paths.name}\"`,
            prefix,
            compileTask;
        
        switch(paths.ext){
            case ".c":
                prefix = (gnuPath != null) ? `\"${gnuPath}\\gcc\"` : 'gcc';
                break;
            case ".cpp":
                prefix = (gnuPath != null) ? `\"${gnuPath}\\g++\"` : 'g++';
                break;
        }
        compileTask = `${prefix} ${flags} ${sufix}`;
        
        output.appendLine(`Compiling ${paths.base}...`);
        exec(compileTask, (error, stdout, stderr) => {
            if(stderr){
                for (let line of stderr.split("\n"))
                    output.appendLine(line.substring(line.indexOf(paths.base)));
            }
            output.appendLine((error) ? 'Error' : 'Succesfully compiled file');
            if(run && !error) this.run();
        });
    },

        
    run: function (){
        let paths = path.parse(vscode.window.activeTextEditor.document.fileName);//Finds the active text editor's path
        let runTask = `start /wait cmd /c \"\"${paths.dir}\\${paths.name}.exe\" && pause\"`;

        output.appendLine('[Running...]');

        exec(runTask, () => {
            output.appendLine('[Done.]');
        });
        
    },

    compileAndRun: function (gnuPath, flags){
        this.compile(gnuPath, flags, true);
    },

    sla: function (bt, txt, clr, cmd){
        bt.text = txt;
        bt.color = clr;
        bt.command = cmd;
        bt.show();
    },

    createButtons: function (BT, mode){
        let color = vscode.workspace.getConfiguration('C/C++ Compiler').get('BTColor');

        if(mode == DEBUG) this.sla(BT.mode, 'Debug', color, 'comp.changeMode');
        else if(mode == RELEASE) this.sla(BT.mode, 'Release', color, 'comp.changeMode');
        this.sla(BT.compile, '⛭ Compile', color, 'comp.compile');
        this.sla(BT.run, '▶ Run', color, 'comp.run');
        this.sla(BT.compileRun, '⛭▶ Compile/Run', color, 'comp.compileRun');
    }
}
module.exports.code = code
module.exports.output = output;