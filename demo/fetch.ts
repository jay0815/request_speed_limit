import LimitQueue from "../main";

const queue = new LimitQueue(4);

class RequestItem {
  res: Response | undefined;
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  requestApi = async (signal: AbortController['signal']) => {
    const res = await fetch(
      'https://jsonplaceholder.typicode.com/posts/1', { signal }
    ).then(
      (response) => response.json()
    );
    return res;
  }
}

const main = async () => {

    ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].forEach(async (i) => {
      const R = new RequestItem(i);
      const res = await queue.request_execute(R.requestApi, R.name);
      console.log(R.name, 'res: ', res)
    });

    setTimeout(() => {
      queue.kill()
    }, 400)
}

main();


