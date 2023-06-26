import fs from "node:fs";
import path from "node:path";
import {errorHandler} from "./service-functions.js";

export default async function moveFile(mes, command) {
    const copyFromMove = mes.replace(command, '').trimStart().split(' ').at(0);
    const copyToMove = mes.replace(command, '').trimStart().split(' ').at(1);
    const readMove = fs.createReadStream(copyFromMove);
    const writeMove = fs.createWriteStream(path.resolve(copyToMove, path.basename(copyFromMove)));
    readMove.on('close', err => {
        if (err) errorHandler(err)
        fs.unlink(copyFromMove, err => errorHandler(err))
    });
    readMove.on('error', err => errorHandler(err));
    writeMove.on('error', err => errorHandler(err));
    await readMove.pipe(writeMove);
}
