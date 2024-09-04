import { StatefulObservable } from "../util/ObservableUtils";
import { avatarStorage } from "./avatars";
import { BackendResourceUtils } from "../util/BackendResourceUtils";

type OptionsState = {
    userAvatarId?: string | null;

    // Whisper: for external Python module
    whisper?:
        | "disabled" // default
        | "tiny.en"
        | "tiny"
        | "base.en"
        | "base"
        | "small.en"
        | "small"
        | "medium.en"
        | "medium"
        | "large-v1"
        | "large-v2"
        | "large-v3"
        | "large"
        | "distil-large-v2"
        | "distil-medium.en"
        | "distil-small.en"
        | "distil-large-v3";
    whisperDevice?: string;
    whisperKeepLoaded?: boolean;
    whisperAutoSend?: boolean;
};

export const optionsStorage = new StatefulObservable<OptionsState>({});

export const saveOptions = async () => {
    await BackendResourceUtils.setSingle("options", optionsStorage.get());
};

export const loadOptions = async () => {
    optionsStorage.set(
        (await BackendResourceUtils.getSingle("options")) as OptionsState
    );
    // Set default options
    const options = optionsStorage.get();

    let madeChanges = false;

    if (!options.whisper) {
        options.whisper = "disabled";
        madeChanges = true;
    }
    if (!options.whisperDevice) {
        options.whisperDevice = "cpu";
        madeChanges = true;
    }
    if (options.whisperKeepLoaded === undefined) {
        options.whisperKeepLoaded = false;
        madeChanges = true;
    }
    if (options.whisperAutoSend === undefined) {
        options.whisperAutoSend = true;
        madeChanges = true;
    }

    if (madeChanges) {
        optionsStorage.set(options);
        await saveOptions();
    }

    await clearRedundantOptions();
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

export const setWhisper = async (whisper: OptionsState["whisper"]) => {
    optionsStorage.set({
        ...optionsStorage.get(),
        whisper,
    });
    await saveOptions();
};

export const setWhisperDevice = async (
    whisperDevice: OptionsState["whisperDevice"]
) => {
    optionsStorage.set({
        ...optionsStorage.get(),
        whisperDevice,
    });
    await saveOptions();
};

export const setWhisperKeepLoaded = async (
    whisperKeepLoaded: OptionsState["whisperKeepLoaded"]
) => {
    optionsStorage.set({
        ...optionsStorage.get(),
        whisperKeepLoaded,
    });
    await saveOptions();
};

export const setWhisperAutoSend = async (
    whisperAutoSend: OptionsState["whisperAutoSend"]
) => {
    optionsStorage.set({
        ...optionsStorage.get(),
        whisperAutoSend,
    });
    await saveOptions();
};

export const clearRedundantOptions = async () => {
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

    if (haveUpdate) {
        optionsStorage.set(update);
        await saveOptions();
    }
};
