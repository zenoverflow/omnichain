import { StatefulObservable } from "../util/ObservableUtils";
import { ImgUtils } from "../util/ImgUtils";
import { QueueUtils } from "../util/QueueUtils";
import { db } from "../data/db";
import { ChatAvatar } from "../data/types";
import { clearRedundantOptions } from "./options";

export const avatarStorage = new StatefulObservable<Record<string, ChatAvatar>>(
    {}
);

export const loadAvatarsFromDb = async () => {
    avatarStorage.set(
        Object.fromEntries(
            (await db.chatAvatars.toArray()).map((c) => [c.avatarId, c])
        )
    );
};

// ACTIONS //

export const createAvatar = (name = "Anon") => {
    QueueUtils.addTask(async () => {
        const created: ChatAvatar = ImgUtils.empty(name);
        avatarStorage.set({
            ...avatarStorage.get(),
            [created.avatarId]: created,
        });
        await db.chatAvatars.add(created);
    });
};

export const updateAvatarName = (avatarId: string, name: string) => {
    QueueUtils.addTask(async () => {
        const storage = avatarStorage.get();
        const target = storage[avatarId];

        const update: ChatAvatar = {
            ...target,
            name,
        };

        avatarStorage.set({
            ...storage,
            [avatarId]: update,
        });
        await db.chatAvatars.put(update);
    });
};

export const updateAvatarImage = (avatarId: string, image: File) => {
    QueueUtils.addTask(async () => {
        const storage = avatarStorage.get();
        const target = storage[avatarId];

        const update: ChatAvatar = {
            ...target,
            imageBase64: await ImgUtils.resizeImage(image, 150, 150),
        };

        avatarStorage.set({
            ...storage,
            [avatarId]: update,
        });
        await db.chatAvatars.put(update);
    });
};

export const deleteAvatar = (avatarId: string) => {
    QueueUtils.addTask(async () => {
        avatarStorage.set(
            Object.fromEntries(
                Object.entries(avatarStorage.get()).filter(
                    ([id]) => id !== avatarId
                )
            )
        );
        await db.chatAvatars.delete(avatarId);
        clearRedundantOptions();
    });
};
