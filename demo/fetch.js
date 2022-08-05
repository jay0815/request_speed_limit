"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = __importDefault(require("../main"));
const queue = new main_1.default(4);
class RequestItem {
    res;
    name;
    constructor(name) {
        this.name = name;
    }
    requestApi = async (signal) => {
        const res = await fetch('https://jsonplaceholder.typicode.com/posts/1', { signal }).then((response) => response.json());
        return res;
    };
}
const main = async () => {
    ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].forEach(async (i) => {
        const R = new RequestItem(i);
        const res = await queue.request_execute(R.requestApi, R.name);
        console.log(R.name, 'res: ', res);
    });
    setTimeout(() => {
        queue.kill();
    }, 400);
};
main();
