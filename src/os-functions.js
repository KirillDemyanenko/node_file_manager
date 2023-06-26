import os from "node:os";
import process from "node:process";
import {SendMessage} from "./service-functions.js";

export default function osData (params) {
    switch (params) {
        case '--EOL': {
            console.log(JSON.stringify(os.EOL));
            break;
        }
        case '--cpus': {
            console.log(os.cpus());
            break;
        }
        case '--homedir': {
            console.log(os.homedir());
            break;
        }
        case '--username': {
            console.log(os.userInfo().username);
            break;
        }
        case '--architecture': {
            console.log(process.arch);
            break;
        }
        default:
            SendMessage('Invalid input', 'red');
    }
}
