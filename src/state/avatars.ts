import { atom } from "jotai";

import { appStore } from ".";
import { ImgUtils } from "../util/ImgUtils";
import { db } from "../db";
import { ChatAvatar } from "../db/data";
import { clearRedundantOptions } from "./options";

const _avatarStorageAtom = atom<Record<string, ChatAvatar>>({});

export const avatarStorageAtom = atom((get) => ({
    ...get(_avatarStorageAtom),
}));

export const loadAvatarsFromDb = async () => {
    appStore.set(
        _avatarStorageAtom,
        Object.fromEntries(
            (await db.chatAvatars.toArray()).map((c) => [c.avatarId, c])
        )
    );
};

export const createAvatar = (name: string = "Anon"): void => {
    const s = appStore.get(_avatarStorageAtom);
    const created: ChatAvatar = ImgUtils.empty(name);
    const id = created.avatarId;
    appStore.set(_avatarStorageAtom, {
        ...s,

        [id]: created,
    });
    db.chatAvatars.add(created);
};

export const updateAvatarName = (avatarId: string, name: string) => {
    const s = appStore.get(_avatarStorageAtom);
    const target = s[avatarId];

    const update: ChatAvatar = {
        ...target,
        name,
    };

    appStore.set(_avatarStorageAtom, {
        ...s,
        [avatarId]: update,
    });
    db.chatAvatars.put(update);
};

export const updateAvatarImage = async (avatarId: string, image: File) => {
    const s = appStore.get(_avatarStorageAtom);
    const target = s[avatarId];

    const update: ChatAvatar = {
        ...target,
        imageBase64: await ImgUtils.resizeImage(image, 150, 150),
    };

    appStore.set(_avatarStorageAtom, {
        ...s,
        [avatarId]: update,
    });
    db.chatAvatars.put(update);
};

export const deleteAvatar = (avatarId: string) => {
    const s = appStore.get(_avatarStorageAtom);

    appStore.set(
        _avatarStorageAtom,
        Object.fromEntries(
            Object.entries(s).filter(([id, _]) => id !== avatarId)
        )
    );
    db.chatAvatars.delete(avatarId);
    clearRedundantOptions();
};
