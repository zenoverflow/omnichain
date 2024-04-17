const _queue: (() => Promise<any>)[] = [];

export const QueueUtils = {
    runQueue() {
        const runner = async () => {
            if (_queue.length) {
                const next = _queue.shift();
                if (next) await next();
                setTimeout(() => {
                    void runner();
                }, 1);
            } else {
                setTimeout(() => {
                    void runner();
                }, 30);
            }
        };
        void runner();
    },

    addTask(task: () => Promise<void>) {
        _queue.push(task);
    },
};
