import { atom } from "jotai";

import { appStore } from ".";

const _loaderAtom = atom<boolean>(false);

export const loaderAtom = atom((get) => get(_loaderAtom));

export const startGlobalLoading = () => {
    appStore.set(_loaderAtom, true);
};

export const finishGlobalLoading = () => {
    appStore.set(_loaderAtom, false);
};
