import { atom } from "jotai";

import { appStore } from ".";
import { MsgUtils } from "../util/MsgUtils";
import { ChatMessage, db } from "../db";

const _messageStorageAtom = atom<Record<string, ChatMessage>>({});

export const messageStorageAtom = atom((get) => ({
    ...get(_messageStorageAtom),
}));

export const unloadMessages = () => {
    appStore.set(_messageStorageAtom, {});
};

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

export const addMessage = (
    chainId: string,
    avatarId: string,
    content: string
): void => {
    const s = appStore.get(_messageStorageAtom);
    const created = MsgUtils.fresh(chainId, avatarId, content);
    const id = created.messageId;
    appStore.set(_messageStorageAtom, {
        ...s,

        [id]: created,
    });
    db.chatMessages.add(created);
};

export const setMessageProcessed = (messageId: string) => {
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
    db.chatMessages.put(update);
};

export const deleteMessage = (messageId: string) => {
    const s = appStore.get(_messageStorageAtom);

    appStore.set(
        _messageStorageAtom,
        Object.fromEntries(
            Object.entries(s).filter(([id, _]) => id !== messageId)
        )
    );
    db.chatMessages.delete(messageId);
};
