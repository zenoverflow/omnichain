import { StatefulObservable } from "../util/ObservableUtils";

export const loaderStorage = new StatefulObservable<boolean>(false);

let startTimeout: NodeJS.Timeout | null = null;
let finishTimeout: NodeJS.Timeout | null = null;

export const startGlobalLoading = () => {
    if (startTimeout) {
        clearTimeout(startTimeout);
    }
    if (finishTimeout) {
        clearTimeout(finishTimeout);
    }
    startTimeout = setTimeout(() => {
        loaderStorage.set(true);
    }, 120);
};

export const finishGlobalLoading = () => {
    if (startTimeout) {
        clearTimeout(startTimeout);
    }
    if (finishTimeout) {
        clearTimeout(finishTimeout);
    }
    finishTimeout = setTimeout(() => {
        loaderStorage.set(false);
    }, 1000);
};
