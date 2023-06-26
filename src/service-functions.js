import process from "node:process";
import {rl, user, userHomeDirectory} from "../index.js";

export function SendMessage(message, color) {
    let col;
    switch (color) {
        case 'green':
            col = 33;
            break;
        case 'yellow':
            col = 93;
            break;
        default:
            col = 31;
            break;
    }
    console.log(`\x1b[${col}m ${message} \x1b[0m`);
}

export function printCurrentDirectory() {
    SendMessage(`You are currently in '${process.cwd()}'`, 'green');
}

export function startApp() {
    SendMessage(`Welcome to the File Manager, ${user}!`, 'green');
    process.chdir(userHomeDirectory);
    printCurrentDirectory();
}

export function exit() {
    SendMessage(`Thank you for using File Manager, ${user}, goodbye!`, 'yellow');
    rl.close();
}

export function selectCommand(str) {
    return str.includes(' ') ? str.split(' ').at(0) : str;
}

export function errorHandler(err) {
    if (err) SendMessage('Operation failed', 'red');
}
