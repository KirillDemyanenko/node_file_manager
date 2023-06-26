import process from 'node:process';
import readline from 'node:readline'
import os from 'node:os';
import * as path from "path";
import fs from "fs";

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
    return str.includes(' ') ? str.split(' ').at(0) : str;
}

function errorHandler(err) {
    if (err) SendMessage('Operation failed', 'red');
}

const rl = readline.createInterface({input: process.stdin, output: process.stdout});
const args = process.argv.slice(2);
const user = args[0].replace('--username=', '');
const userHomeDirectory = os.homedir();

startApp();

rl.on('line', async (mes) => {
    const command = selectCommand(mes);
    switch (command) {
        case '.exit': {
            exit();
            break;
        }
        case 'up': {
            await process.chdir(path.join(process.cwd(),'../'));
            break;
        }
        case 'add': {
            await fs.open(path.resolve(
                mes.replace(command, '').trimStart()), 'w',
                    err => errorHandler(err)
            )
            break;
        }
        case 'cat': {
            const readStream = await fs.createReadStream(mes.replace(command, '').trimStart())
            readStream.on('data', (chunk) => {
                console.log(chunk.toString())
            })
            readStream.on('error', err => errorHandler(err))
            break;
        }
        case 'ls': {
            const files = await fs.promises.readdir(process.cwd(), {withFileTypes: true})
                .then(files => files.sort((a,b) => {
                    if (a.isFile() && b.isFile()) return 0
                    if (!a.isFile() && !b.isFile()) return 0
                    return a.isFile() ? 1 : -1
                }))
                .catch(err => errorHandler(err))
            const obj = []
            for (let file of files) {
                obj.push({Name: file.name, Type: file.isFile() ? 'file' : 'directory'})
            }
            console.table(obj)
            break;
        }
        case 'cd': {
            const newPath = mes.replace(command, '').trimStart();
            try {
                process.chdir(path.resolve(newPath));
            }
            catch (err) {
                errorHandler(err);
            }
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
