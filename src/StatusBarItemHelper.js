const vscode = require('vscode');

class StatusBarItemHelper {
    constructor(text, color, command){
        this.statusBarItem = vscode.window.createStatusBarItem();
        this.statusBarItem.text = text;
        this.statusBarItem.color = color;
        this.statusBarItem.command = command;
        this.statusBarItem.show();
    }

    setText(text){
        this.statusBarItem.text = text;
    }
    
}
module.exports = {StatusBarItemHelper};