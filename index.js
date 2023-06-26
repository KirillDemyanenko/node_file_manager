import process from 'node:process';
import readline from 'node:readline'
import os from 'node:os';
import * as path from "path";

function SendMessage(message, color) {
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

function printCurrentDirectory() {
    SendMessage(`You are currently in '${process.cwd()}'`, 'green');
}

function startApp() {
    SendMessage(`Welcome to the File Manager, ${user}!`, 'green');
    process.chdir(userHomeDirectory);
    printCurrentDirectory();
}

function exit() {
    SendMessage(`Thank you for using File Manager, ${user}, goodbye!`, 'yellow');
    rl.close();
}

function selectCommand(str) {
    return str.includes(' ') ? str.split(' ').at(0) : str
}

function errorHandler(err) {
    if (err) throw new Error('Operation failed');
}

const rl = readline.createInterface({input: process.stdin, output: process.stdout});
const args = process.argv.slice(2);
const user = args[0].replace('--username=', '');
const userHomeDirectory = os.homedir();

startApp();

rl.on('line', (mes) => {
    const command = selectCommand(mes)
    switch (command) {
        case '.exit': {
            exit();
            break;
        }
        case 'up': {
            process.chdir(path.join(process.cwd(),'../'));
            break;
        }
        default:
            SendMessage('Invalid input', 'red');
    }
    command === '.exit' || printCurrentDirectory();
})

rl.on('SIGINT', () => {
    exit();
})
