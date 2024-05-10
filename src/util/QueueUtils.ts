const _queue: (() => Promise<any>)[] = [];

export const QueueUtils = {
    runQueue() {
        const runner = async () => {
            if (_queue.length) {
                if (_queue.length) {
                    try {
                        await _queue[_queue.length - 1]();
                    } catch (error) {
                        console.error(error);
                    }
                    _queue.shift();
                }
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

    busy() {
        return _queue.length > 0;
    },
};
