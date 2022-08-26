const vscode = require('vscode');

class StatusBarItemHelper {
    #statusBarItem;
    static createdStatusBarItems = new Array();
    constructor(text, command){
        this.#statusBarItem = vscode.window.createStatusBarItem();
        this.#statusBarItem.text = text;
        this.#statusBarItem.color = "#FFFFFF";
        this.#statusBarItem.command = command;
        this.#statusBarItem.show();
        StatusBarItemHelper.createdStatusBarItems.push(this.#statusBarItem);
    }

    setText(text){
        this.#statusBarItem.text = text;
    }
    static setColor(color){
        for(let statusBarItem of this.createdStatusBarItems){
                statusBarItem.color = color;
        }

    }   
}
module.exports = {StatusBarItemHelper};