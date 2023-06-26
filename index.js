import process from 'node:process';
import readline from 'node:readline'
import os from 'node:os';
import * as path from "node:path";
import fs from "node:fs";
import crypto from 'node:crypto'
import * as zlib from "node:zlib";

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
        case 'os': {
            const params = mes.replace(command, '').trimStart()
            switch (params) {
                case '--EOL': {
                    console.log(JSON.stringify(os.EOL))
                    break
                }
                case '--cpus': {
                    console.log(os.cpus())
                    break
                }
                case '--homedir': {
                    console.log(os.homedir())
                    break
                }
                case '--username': {
                    console.log(os.userInfo().username)
                    break
                }
                case '--architecture': {
                    console.log(process.arch)
                    break
                }
                default:
                    SendMessage('Invalid input', 'red');
            }
            break;
        }
        case 'hash': {
            const hash = crypto.createHash('sha256')
            let dataForHash = ''
            fs.readFile(mes.replace(command, '').trimStart(),
                (err, data) => {
                    if (err) errorHandler(err)
                    dataForHash.concat(data.toString())
                })
            hash.update(dataForHash)
            console.log(hash.digest('hex'))
            break
        }
        case 'up': {
            await process.chdir(path.join(process.cwd(),'../'));
            break;
        }
        case 'rn': {
            const oldName = mes.replace(command, '').trimStart().split(' ').at(0)
            const newName = mes.replace(command, '').trimStart().split(' ').at(1)
            await fs.rename(path.resolve(oldName), path.resolve(newName), err => errorHandler(err))
            break;
        }
        case 'add': {
            await fs.open(path.resolve(
                mes.replace(command, '').trimStart()), 'w',
                    err => errorHandler(err)
            )
            break;
        }
        case 'cp': {
            const copyFrom = mes.replace(command, '').trimStart().split(' ').at(0)
            const copyTo = mes.replace(command, '').trimStart().split(' ').at(1)
            const copyRead = fs.createReadStream(copyFrom)
            const copyWrite = fs.createWriteStream(path.resolve(copyTo, path.basename(copyFrom)))
            copyWrite.on('error', err => errorHandler(err))
            copyRead.on('error', err => errorHandler(err))
            copyRead.pipe(copyWrite);
            break;
        }
        case 'mv': {
            const copyFromMove = mes.replace(command, '').trimStart().split(' ').at(0)
            const copyToMove = mes.replace(command, '').trimStart().split(' ').at(1)
            const readMove = fs.createReadStream(copyFromMove)
            const writeMove = fs.createWriteStream(path.resolve(copyToMove, path.basename(copyFromMove)))
            readMove.on('close', err => {
                if (err) errorHandler(err)
                fs.unlink(copyFromMove, err => errorHandler(err))
            })
            readMove.on('error', err => errorHandler(err))
            writeMove.on('error', err => errorHandler(err))
            await readMove.pipe(writeMove);
            break;
        }
        case 'compress': {
            const copyFromCompress = mes.replace(command, '').trimStart().split(' ').at(0)
            const copyToCompress = mes.replace(command, '').trimStart().split(' ').at(1)
            const brotli = zlib.createBrotliCompress();
            fs.createReadStream(copyFromCompress).pipe(brotli).pipe(fs.createWriteStream(path.resolve(copyToCompress, path.basename(copyFromCompress).concat('.br'))));
            break;
        }
        case 'decompress': {
            const copyFromDecompress = mes.replace(command, '').trimStart().split(' ').at(0)
            const copyToDecompress = mes.replace(command, '').trimStart().split(' ').at(1)
            const brotli = zlib.createBrotliDecompress();
            fs.createReadStream(copyFromDecompress).pipe(brotli).pipe(fs.createWriteStream(path.resolve(copyToDecompress, path.basename(copyFromDecompress).replace('.br', ''))));
            break;
        }
        case 'rm': {
            fs.unlink(path.resolve(mes.replace(command, '').trimStart().split(' ').at(0)), err => errorHandler(err))
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
