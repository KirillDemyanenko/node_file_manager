import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";
import {errorHandler} from "./service-functions.js";

export default function compressBrotli(mes, command) {
    const copyFromCompress = mes.replace(command, '').trimStart().split(' ').at(0);
    const copyToCompress = mes.replace(command, '').trimStart().split(' ').at(1);
    if (typeof copyToCompress === "undefined" || typeof copyFromCompress === "undefined") {
        errorHandler(new Error())
        return
    }
    const brotli = zlib.createBrotliCompress();
    const compressRead = fs.createReadStream(copyFromCompress);
    const compressWrite = fs.createWriteStream(
        path.resolve(copyToCompress, path.basename(copyFromCompress).concat('.br'))
    );
    compressRead.on('error', err => errorHandler(err));
    compressWrite.on('error', err => errorHandler(err));
    compressRead.pipe(brotli).pipe(compressWrite);
}
