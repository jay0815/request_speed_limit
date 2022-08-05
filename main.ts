class LimitQueue {
  PENDING_TASK_ARRAY: { task: <T>() => Promise<T>; name: string }[] = [];
  EXECUTING_COUNT = 0;
  LIMIT = Infinity;
  book = new Map<string, AbortController>();

  constructor(limit: number) {
    this.LIMIT = limit;
  }

  request_execute = async <T extends (signal: AbortController['signal']) => Promise<any>>(
    request: T,
    name: string,
  ) => {
    let res;
    type ResponseType = ReturnType<T> extends Promise<infer U> ? U : undefined;
    const controller = new AbortController();
    const taskJob = {
      task: async <ResponseType>() => {
        res = await request(controller.signal);
        return res as unknown as ResponseType;
      },
      name,
    };
    this.book.set(name, controller)
    try {
      if (this.EXECUTING_COUNT <= this.LIMIT) {
        await this.run(taskJob);
      } else {
        this.PENDING_TASK_ARRAY.push(taskJob);
      }
    } catch (e) {
      console.log('request_execute error', e);
    }
    return res as (ResponseType | undefined);
  };

  async run({ task, name }: { task: () => Promise<Response>; name: string }) {
    this.EXECUTING_COUNT++;
    try {
      await task().catch((error) => {
        console.log(`task ${name} error from promise: ${error}`);
        return error;
      });
    } catch (error) {
      console.log(`task ${name} error from execute construct: ${error}`);
    } finally {
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

export default LimitQueue;

