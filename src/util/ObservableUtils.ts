export class SimpleObservable<T> {
    private observers: Array<(data: T) => void> = [];

    public subscribe(fn: (data: T) => void) {
        this.observers.push(fn);

        return (): void => {
            this.unsubscribe(fn);
        };
    }

    private unsubscribe(fn: (data: T) => void) {
        this.observers = this.observers.filter(
            (subscriber) => subscriber !== fn
        );
    }

    public next(data: T) {
        this.observers.forEach((observer) => {
            observer(data);
        });
    }
}

export class StatefulObservable<T> {
    private observers: Array<(data: T) => void> = [];

    constructor(private state: T) {}

    public subscribe(fn: (data: T) => void) {
        fn(this.state);

        this.observers.push(fn);

        return (): void => {
            this.unsubscribe(fn);
        };
    }

    private unsubscribe(fn: (data: T) => void) {
        this.observers = this.observers.filter((obs) => obs !== fn);
    }

    public get(): T {
        return this.state;
    }

    public set(data: T) {
        this.state = data;
        this.observers.forEach((fn) => {
            fn(this.state);
        });
    }
}
