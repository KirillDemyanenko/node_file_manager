import fs from "node:fs";
import path from "node:path";
import {errorHandler} from "./service-functions.js";

export default function copyFile (mes, command) {
    const copyFrom = mes.replace(command, '').trimStart().split(' ').at(0);
    const copyTo = mes.replace(command, '').trimStart().split(' ').at(1);
    const copyRead = fs.createReadStream(copyFrom);
    const copyWrite = fs.createWriteStream(path.resolve(copyTo, path.basename(copyFrom)));
    copyWrite.on('error', err => errorHandler(err));
    copyRead.on('error', err => errorHandler(err));
    copyRead.pipe(copyWrite);
}
