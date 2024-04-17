import { atom } from "jotai";

import { appStore } from ".";

const _nodeSelectionAtom = atom<string[]>([]);

export const nodeSelectionAtom = atom<string[]>((get) => [
    ...get(_nodeSelectionAtom),
]);

export const updateNodeSelection = (selection: string[]) => {
    console.log("updateNodeSelection", selection);
    appStore.set(_nodeSelectionAtom, selection);
};
