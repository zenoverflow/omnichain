import { StatefulObservable } from "../util/ObservableUtils";

export const nodeSelectionStorage = new StatefulObservable<string[]>([]);

export const updateNodeSelection = (selection: string[]) => {
    nodeSelectionStorage.set(selection);
};
