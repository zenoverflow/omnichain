import { StatefulObservable } from "../util/ObservableUtils";
import { ImgUtils } from "../util/ImgUtils";
import { QueueUtils } from "../util/QueueUtils";
import { BackendResourceUtils } from "../util/BackendResourceUtils";
import { ChatAvatar } from "../data/types";
import { clearRedundantOptions } from "./options";

export const avatarStorage = new StatefulObservable<Record<string, ChatAvatar>>(
    {}
);

export const loadAvatars = async () => {
    avatarStorage.set(await BackendResourceUtils.getMultiAll("chatAvatars"));
};

const backendSetChatAvatar = async (id: string, data: Record<string, any>) => {
    await BackendResourceUtils.setMultiSingle("chatAvatars", id, data);
};

const backendDeleteChatAvatar = async (id: string) => {
    await BackendResourceUtils.deleteMultiSingle("chatAvatars", id);
};

// ACTIONS //

export const createAvatar = (name = "Anon") => {
    QueueUtils.addTask(async () => {
        const created: ChatAvatar = ImgUtils.empty(name);
        avatarStorage.set({
            ...avatarStorage.get(),
            [created.avatarId]: created,
        });
        await backendSetChatAvatar(created.avatarId, created);
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
        await backendSetChatAvatar(avatarId, update);
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
        await backendSetChatAvatar(avatarId, update);
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
        await backendDeleteChatAvatar(avatarId);
        await clearRedundantOptions();
    });
};
