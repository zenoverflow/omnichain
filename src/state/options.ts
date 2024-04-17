import { StatefulObservable } from "../util/ObservableUtils";
import { graphStorage } from "./graphs";
import { avatarStorage } from "./avatars";

type OptionsState = {
    userAvatarId: string | null;
    chainChatId: string | null;
    chainApiId: string | null;
    apiPort: number;
};

export const optionsStorage = new StatefulObservable<OptionsState>({
    userAvatarId: localStorage.getItem("userAvatarId") || null,
    chainChatId: localStorage.getItem("chainChatId") || null,
    chainApiId: localStorage.getItem("chainApiId") || null,
    apiPort: Number.parseInt(localStorage.getItem("apiPort") || "13000"),
});

export const setUserAvatar = (userAvatarId: string | null) => {
    optionsStorage.set({
        ...optionsStorage.get(),
        userAvatarId,
    });

    if (!userAvatarId) {
        localStorage.removeItem("userAvatarId");
    } else {
        localStorage.setItem("userAvatarId", userAvatarId);
    }
};

export const setChatChain = (chainChatId: string | null) => {
    optionsStorage.set({
        ...optionsStorage.get(),
        chainChatId,
    });

    if (!chainChatId) {
        localStorage.removeItem("chainChatId");
    } else {
        localStorage.setItem("chainChatId", chainChatId);
    }
};

export const setApiChain = (chainApiId: string | null) => {
    optionsStorage.set({
        ...optionsStorage.get(),
        chainApiId,
    });

    if (!chainApiId) {
        localStorage.removeItem("chainApiId");
    } else {
        localStorage.setItem("chainApiId", chainApiId);
    }
};

export const setApiPort = (apiPort: number) => {
    optionsStorage.set({
        ...optionsStorage.get(),
        apiPort,
    });
    localStorage.setItem("apiPort", apiPort.toString());
};

export const clearRedundantOptions = () => {
    const graphs = graphStorage.get();
    const avatars = avatarStorage.get();
    const options = optionsStorage.get();

    if (
        !options.chainChatId ||
        !Object.keys(graphs).includes(options.chainChatId)
    ) {
        setChatChain(null);
    }
    if (
        !options.chainApiId ||
        !Object.keys(graphs).includes(options.chainApiId)
    ) {
        setApiChain(null);
    }
    if (
        !options.userAvatarId ||
        !Object.keys(avatars).includes(options.userAvatarId)
    ) {
        setUserAvatar(null);
    }
};
