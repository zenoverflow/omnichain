import { StatefulObservable } from "../util/ObservableUtils";
import { graphStorage } from "./graphs";
import { avatarStorage } from "./avatars";
import { BackendResourceUtils } from "../util/BackendResourceUtils";

type OptionsState = {
    userAvatarId?: string | null;
    defaultChainId?: string | null;
};

export const optionsStorage = new StatefulObservable<OptionsState>({
    userAvatarId: null,
    defaultChainId: null,
});

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

export const setOptions = async (options: OptionsState) => {
    optionsStorage.set(options);
    await saveOptions();
};

export const setUserAvatar = async (userAvatarId: string | null) => {
    optionsStorage.set({
        ...optionsStorage.get(),
        userAvatarId,
    });
    await saveOptions();
};

export const setDefaultChain = async (graphId: string | null) => {
    optionsStorage.set({
        ...optionsStorage.get(),
        defaultChainId: graphId,
    });
    await saveOptions();
};

export const clearRedundantOptions = async () => {
    const graphs = graphStorage.get();
    const avatars = avatarStorage.get();
    const options = optionsStorage.get();

    let haveUpdate = false;

    const update = { ...options };

    if (
        !options.userAvatarId ||
        !Object.keys(avatars).includes(options.userAvatarId)
    ) {
        update.userAvatarId = null;
        haveUpdate = true;
    }
    if (
        !options.defaultChainId ||
        !Object.keys(graphs).includes(options.defaultChainId)
    ) {
        update.defaultChainId = null;
        haveUpdate = true;
    }

    if (haveUpdate) {
        optionsStorage.set(update);
        await saveOptions();
    }
};
