import { atom } from "jotai";

import { appStore } from ".";
import { ImgUtils } from "../util/ImgUtils";
import { QueueUtils } from "../util/QueueUtils";
import { db } from "../data/db";
import { ChatAvatar } from "../data/types";
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

// ACTIONS //

export const createAvatar = (name = "Anon") => {
    QueueUtils.addTask(async () => {
        const s = appStore.get(_avatarStorageAtom);
        const created: ChatAvatar = ImgUtils.empty(name);
        const id = created.avatarId;
        appStore.set(_avatarStorageAtom, {
            ...s,

            [id]: created,
        });
        await db.chatAvatars.add(created);
    });
};

export const updateAvatarName = (avatarId: string, name: string) => {
    QueueUtils.addTask(async () => {
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
        await db.chatAvatars.put(update);
    });
};

export const updateAvatarImage = (avatarId: string, image: File) => {
    QueueUtils.addTask(async () => {
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
        await db.chatAvatars.put(update);
    });
};

export const deleteAvatar = async (avatarId: string) => {
    QueueUtils.addTask(async () => {
        const s = appStore.get(_avatarStorageAtom);

        appStore.set(
            _avatarStorageAtom,
            Object.fromEntries(
                Object.entries(s).filter(([id, _]) => id !== avatarId)
            )
        );
        await db.chatAvatars.delete(avatarId);
        clearRedundantOptions();
    });
};
