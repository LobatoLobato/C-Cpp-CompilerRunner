const vscode = require('vscode');
const { exec } = require('child_process');
const { platform } = require('os');
const output = vscode.window.createOutputChannel('C/C++ compiler');
const DEBUG = 0, RELEASE = 1;

const code = {
    compile: function(paths, gnuPath, rodar, flags) {
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
        
        output.clear();
        output.appendLine(`Compiling ${paths.base}...`);
        exec(compileTask, (error, stdout, stderr) => {
            if(stderr){
                const auxArray = stderr.split(`${paths.dir}\\${paths.base}:`);
                let stderrMessage = "";
                for(let i=1;i<auxArray.length;i++)
                    stderrMessage +=  auxArray[i];	
                output.appendLine(stderrMessage);
            }
            if(!error){
                output.appendLine('Succesfully compiled file');
                if(rodar) this.run(paths, false);
            }else if(error)
                output.appendLine('Error ¬¬');
        });
    },

        
    run: function (paths, clear){
        let runTask = "";

        if(platform() == 'win32')
            runTask = `start /wait cmd /c \"\"${paths.dir}\\${paths.name}.exe\" && pause\"`;
        else if(platform() == 'linux')
            runTask = `gnome-terminal -- bash -c \" '${paths.dir}/${paths.name}'; read -p 'Press any key to continue.'\"`;

        if(clear == true) output.clear();

        output.appendLine('[Running...]');

        exec(runTask, () => {
            output.appendLine('[Done.]');
        });
        
    },

    compileAndRun: function (paths, gnuPath, flags){
        this.compile(paths, gnuPath, true, flags)
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
        this.sla(BT.reload, '↻', color, 'comp.reloadBT');
        this.sla(BT.compile, '⛭ Compile', color, 'comp.compile');
        this.sla(BT.run, '▶ Run', color, 'comp.run');
        this.sla(BT.compileRun, '⛭▶ Compile/Run', color, 'comp.compileRun');
    }
}
module.exports.code = code
module.exports.output = output;