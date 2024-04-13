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
        this.observers.forEach((observer) => observer(data));
    }
}
