import {errorHandler} from "./service-functions.js";
import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";

export default function decompressBrotli(mes, command) {
    const copyFromDecompress = mes.replace(command, '').trimStart().split(' ').at(0);
    const copyToDecompress = mes.replace(command, '').trimStart().split(' ').at(1);
    if (typeof copyFromDecompress === "undefined" || typeof copyToDecompress === "undefined" || path.extname(copyFromDecompress) !== '.br') {
        errorHandler(new Error())
        return
    }
    const brotli = zlib.createBrotliDecompress();
    const decompressRead = fs.createReadStream(copyFromDecompress);
    const decompressWrite = fs.createWriteStream(
        path.resolve(copyToDecompress, path.basename(copyFromDecompress).replace('.br', ''))
    );
    decompressRead.on('error', err => errorHandler(err));
    decompressWrite.on('error', err => errorHandler(err));
    decompressRead.pipe(brotli).pipe(decompressWrite);
}
