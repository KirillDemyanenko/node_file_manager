import crypto from "node:crypto";
import fs from "node:fs";
import {errorHandler} from "./service-functions.js";

export default function calculateHash(path) {
    const hash = crypto.createHash('sha256');
    let dataForHash = '';
    fs.readFile(path,
        (err, data) => {
            if (err) errorHandler(err);
            dataForHash.concat(data.toString());
        })
    hash.update(dataForHash);
    console.log(hash.digest('hex'));
}
