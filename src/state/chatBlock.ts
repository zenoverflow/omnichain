import { atom } from "jotai";

import { appStore } from ".";

const _chatBlockAtom = atom<boolean>(false);

export const chatBlockAtom = atom((get) => get(_chatBlockAtom));

export const blockChat = () => {
    appStore.set(_chatBlockAtom, true);
};

export const unblockChat = () => {
    appStore.set(_chatBlockAtom, false);
};
