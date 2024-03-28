import { atom } from "jotai";

import { appStore } from ".";

type WatcherState = {
    lastEditorUpdate: number | null;
};

const _watcherStateAtom = atom<WatcherState>({
    lastEditorUpdate: null,
});

export const watcherStateAtom = atom((get) => ({ ...get(_watcherStateAtom) }));

export const signalEditorUpdate = () => {
    appStore.set(_watcherStateAtom, {
        ...appStore.get(_watcherStateAtom),
        lastEditorUpdate: Date.now(),
    });
};
