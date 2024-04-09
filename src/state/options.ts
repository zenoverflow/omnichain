import { atom } from "jotai";

import { appStore } from ".";
import { graphStorageAtom } from "./graphs";
import { avatarStorageAtom } from "./avatars";

type OptionsState = {
    userAvatarId: string | null;
    chainChatId: string | null;
    chainApiId: string | null;
    apiPort: number | 13000;
};

const _optionsAtom = atom<OptionsState>({
    userAvatarId: localStorage.getItem("userAvatarId") || null,
    chainChatId: localStorage.getItem("chainChatId") || null,
    chainApiId: localStorage.getItem("chainApiId") || null,
    apiPort: Number.parseInt(localStorage.getItem("apiPort") || "13000"),
});

export const optionsAtom = atom<OptionsState>((get) => ({
    ...get(_optionsAtom),
}));

export const setUserAvatar = (userAvatarId: string | null) => {
    const s = appStore.get(_optionsAtom);
    appStore.set(_optionsAtom, {
        ...s,
        userAvatarId,
    });

    if (!userAvatarId) {
        localStorage.removeItem("userAvatarId");
    } else {
        localStorage.setItem("userAvatarId", userAvatarId);
    }
};

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

export const clearRedundantOptions = () => {
    const graphs = appStore.get(graphStorageAtom);
    const avatars = appStore.get(avatarStorageAtom);

    const options = appStore.get(_optionsAtom);

    if (!Object.keys(graphs).includes(options.chainChatId)) {
        setChatChain(null);
    }
    if (!Object.keys(graphs).includes(options.chainApiId)) {
        setApiChain(null);
    }
    if (!Object.keys(avatars).includes(options.userAvatarId)) {
        setUserAvatar(null);
    }
};
