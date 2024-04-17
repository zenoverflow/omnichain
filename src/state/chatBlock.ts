import { StatefulObservable } from "../util/ObservableUtils";

export const chatBlockStorage = new StatefulObservable<boolean>(false);

export const blockChat = () => {
    chatBlockStorage.set(true);
};

export const unblockChat = () => {
    chatBlockStorage.set(false);
};
