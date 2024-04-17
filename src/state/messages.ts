import { atom } from "jotai";

import { appStore } from ".";
import { MsgUtils } from "../util/MsgUtils";
import { QueueUtils } from "../util/QueueUtils";
import { db } from "../data/db";
import { ChatMessage } from "../data/types";

const _messageStorageAtom = atom<Record<string, ChatMessage>>({});

export const messageStorageAtom = atom((get) => ({
    ...get(_messageStorageAtom),
}));

export const loadMessagesFromDb = async (chainId: string) => {
    appStore.set(
        _messageStorageAtom,
        Object.fromEntries(
            (
                await db.chatMessages
                    .filter((c) => c.chainId === chainId)
                    .toArray()
            ).map((c) => [c.avatarId, c])
        )
    );
};

// ACTIONS //

export const unloadMessages = () => {
    appStore.set(_messageStorageAtom, {});
};

export const addMessage = (
    chainId: string,
    avatarId: string,
    content: string
) => {
    QueueUtils.addTask(async () => {
        const s = appStore.get(_messageStorageAtom);
        const created = MsgUtils.fresh(chainId, avatarId, content);
        const id = created.messageId;
        appStore.set(_messageStorageAtom, {
            ...s,

            [id]: created,
        });
        await db.chatMessages.add(created);
    });
};

export const setMessageProcessed = (messageId: string) => {
    QueueUtils.addTask(async () => {
        const s = appStore.get(_messageStorageAtom);
        const target = s[messageId];
        const update: ChatMessage = {
            ...target,
            processed: true,
        };
        appStore.set(_messageStorageAtom, {
            ...s,
            [messageId]: update,
        });
        await db.chatMessages.put(update);
    });
};

export const deleteMessage = (messageId: string) => {
    QueueUtils.addTask(async () => {
        const s = appStore.get(_messageStorageAtom);

        appStore.set(
            _messageStorageAtom,
            Object.fromEntries(
                Object.entries(s).filter(([id]) => id !== messageId)
            )
        );
        await db.chatMessages.delete(messageId);
    });
};
