import { StatefulObservable } from "../util/ObservableUtils";
import { graphStorage } from "./graphs";
import { avatarStorage } from "./avatars";
import { BackendResourceUtils } from "../util/BackendResourceUtils";

type OptionsState = {
    userAvatarId?: string | null;
    chainChatId?: string | null;
    chainApiId?: string | null;
};

export const optionsStorage = new StatefulObservable<OptionsState>({});

export const loadOptions = async () => {
    optionsStorage.set(
        (await BackendResourceUtils.getSingle("options")) as OptionsState
    );
    await clearRedundantOptions();
};

export const saveOptions = async () => {
    await BackendResourceUtils.setSingle("options", optionsStorage.get());
};

// ACTIONS //

export const setUserAvatar = async (userAvatarId: string | null) => {
    optionsStorage.set({
        ...optionsStorage.get(),
        userAvatarId,
    });
    await saveOptions();
};

export const setChatChain = async (chainChatId: string | null) => {
    optionsStorage.set({
        ...optionsStorage.get(),
        chainChatId,
    });
    await saveOptions();
};

export const setApiChain = async (chainApiId: string | null) => {
    optionsStorage.set({
        ...optionsStorage.get(),
        chainApiId,
    });
    await saveOptions();
};

export const clearRedundantOptions = async () => {
    const graphs = graphStorage.get();
    const avatars = avatarStorage.get();
    const options = optionsStorage.get();

    const update = { ...options };

    if (
        !options.chainChatId ||
        !Object.keys(graphs).includes(options.chainChatId)
    ) {
        update.chainChatId = null;
    }
    if (
        !options.chainApiId ||
        !Object.keys(graphs).includes(options.chainApiId)
    ) {
        update.chainApiId = null;
    }
    if (
        !options.userAvatarId ||
        !Object.keys(avatars).includes(options.userAvatarId)
    ) {
        update.userAvatarId = null;
    }

    optionsStorage.set(update);
    await saveOptions();
};
