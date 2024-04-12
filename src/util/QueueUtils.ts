const _queue: (() => Promise<any>)[] = [];

export class QueueUtils {
    public static runQueue() {
        const runner = async () => {
            if (_queue.length) {
                await _queue.shift()();
                setTimeout(runner, 1);
            } else {
                setTimeout(runner, 120);
            }
        };
        void runner();
    }

    public static addTask(task: () => Promise<void>) {
        _queue.push(task);
    }
}
