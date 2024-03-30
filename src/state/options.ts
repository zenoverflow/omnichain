import { atom } from "jotai";

import { appStore } from ".";

type OptionsState = {
    chain_chat_id: string | null;
    chain_api_id: string | null;
    api_port: number | 13000;
};

const _optionsAtom = atom<OptionsState>({
    chain_chat_id: localStorage.getItem("chain_chat_id") || null,
    chain_api_id: localStorage.getItem("chain_api_id") || null,
    api_port: Number.parseInt(localStorage.getItem("api_port") || "13000"),
});

export const optionsAtom = atom<OptionsState>((get) => ({
    ...get(_optionsAtom),
}));

export const setChatChain = (chain_chat_id: string) => {
    const s = appStore.get(_optionsAtom);
    appStore.set(_optionsAtom, {
        ...s,
        chain_chat_id,
    });
    localStorage.setItem("chain_chat_id", chain_chat_id);
};

export const setApiChain = (chain_api_id: string) => {
    const s = appStore.get(_optionsAtom);
    appStore.set(_optionsAtom, {
        ...s,
        chain_api_id,
    });
    localStorage.setItem("chain_api_id", chain_api_id);
};

export const setApiPort = (api_port: number) => {
    const s = appStore.get(_optionsAtom);
    appStore.set(_optionsAtom, {
        ...s,
        api_port,
    });
    localStorage.setItem("api_port", `${api_port}`);
};
