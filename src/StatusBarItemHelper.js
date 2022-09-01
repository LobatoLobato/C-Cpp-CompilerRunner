const vscode = require('vscode');

class StatusBarItemHelper {
    /**
     * @type { vscode.StatusBarItem }
     */
    #statusBarItem;

    /**
     * @type { vscode.StatusBarItem[ ] } 
     */
    static createdStatusBarItems = new Array();

    /**
     * @param {string} text
     * @param {string | vscode.Command} command
     */
    constructor(text, command){
        this.#statusBarItem = vscode.window.createStatusBarItem();
        this.#statusBarItem.text = text;
        this.#statusBarItem.color = "#FFFFFF";
        this.#statusBarItem.command = command;
        this.#statusBarItem.show();
        StatusBarItemHelper.createdStatusBarItems.push(this.#statusBarItem);
    }

    /**
     * @param {string} text
     */
    setText(text){
        this.#statusBarItem.text = text;
    }

    static showAll(){
        for (const statusBarItem of this.createdStatusBarItems) {
            statusBarItem.show();
        }
    }
    
    static hideAll(){
        for(let statusBarItem of this.createdStatusBarItems){
            statusBarItem.hide();
        }
    }

    /**
     * @param {string} color
     */
    static setColor(color){
        for(let statusBarItem of this.createdStatusBarItems){
                statusBarItem.color = color;
        }

    }   
}
module.exports = {StatusBarItemHelper};