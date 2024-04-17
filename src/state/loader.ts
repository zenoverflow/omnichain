import { StatefulObservable } from "../util/ObservableUtils";

export const loaderStorage = new StatefulObservable<boolean>(false);

export const startGlobalLoading = () => {
    loaderStorage.set(true);
};

export const finishGlobalLoading = () => {
    loaderStorage.set(false);
};
