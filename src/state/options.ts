import { atom } from "jotai";

import { appStore } from ".";

type OptionsState = {
    chainChatId: string | null;
    chainApiId: string | null;
    apiPort: number | 13000;
};

const _optionsAtom = atom<OptionsState>({
    chainChatId: localStorage.getItem("chainChatId") || null,
    chainApiId: localStorage.getItem("chainApiId") || null,
    apiPort: Number.parseInt(localStorage.getItem("apiPort") || "13000"),
});

export const optionsAtom = atom<OptionsState>((get) => ({
    ...get(_optionsAtom),
}));

export const setChatChain = (chainChatId: string | null) => {
    const s = appStore.get(_optionsAtom);
    appStore.set(_optionsAtom, {
        ...s,
        chainChatId,
    });

    if (!chainChatId) {
        localStorage.removeItem("chainChatId");
    } else {
        localStorage.setItem("chainChatId", chainChatId);
    }
};

export const setApiChain = (chainApiId: string) => {
    const s = appStore.get(_optionsAtom);
    appStore.set(_optionsAtom, {
        ...s,
        chainApiId,
    });
    if (!chainApiId) {
        localStorage.removeItem("chainApiId");
    } else {
        localStorage.setItem("chainApiId", chainApiId);
    }
};

export const setApiPort = (apiPort: number) => {
    const s = appStore.get(_optionsAtom);
    appStore.set(_optionsAtom, {
        ...s,
        apiPort,
    });
    localStorage.setItem("apiPort", `${apiPort}`);
};
