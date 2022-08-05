"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LimitQueue {
    PENDING_TASK_ARRAY = [];
    EXECUTING_COUNT = 0;
    LIMIT = Infinity;
    book = new Map();
    constructor(limit) {
        this.LIMIT = limit;
    }
    request_execute = async (request, name) => {
        let res;
        const controller = new AbortController();
        const taskJob = {
            task: async () => {
                res = await request(controller.signal);
                return res;
            },
            name,
        };
        this.book.set(name, controller);
        try {
            if (this.EXECUTING_COUNT <= this.LIMIT) {
                await this.run(taskJob);
            }
            else {
                this.PENDING_TASK_ARRAY.push(taskJob);
            }
        }
        catch (e) {
            console.log('request_execute error', e);
        }
        return res;
    };
    async run({ task, name }) {
        this.EXECUTING_COUNT++;
        try {
            await task().catch((error) => {
                console.log(`task ${name} error from promise: ${error}`);
                return error;
            });
        }
        catch (error) {
            console.log(`task ${name} error from execute construct: ${error}`);
        }
        finally {
            this.EXECUTING_COUNT--;
            this.book.delete(name);
            if (this.PENDING_TASK_ARRAY.length) {
                const nextTask = this.PENDING_TASK_ARRAY.shift();
                if (nextTask) {
                    this.run(nextTask);
                }
            }
        }
    }
    kill = () => {
        this.book.forEach((controller) => {
            controller.abort();
        });
        /**
         * clear waiting queue
         */
        this.PENDING_TASK_ARRAY = [];
    };
}
exports.default = LimitQueue;
