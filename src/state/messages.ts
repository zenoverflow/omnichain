import { StatefulObservable } from "../util/ObservableUtils";
import { MsgUtils } from "../util/MsgUtils";
import { QueueUtils } from "../util/QueueUtils";
import { db } from "../data/db";
import { ChatMessage } from "../data/types";

export const messageStorage = new StatefulObservable<
    Record<string, ChatMessage>
>({});

export const loadMessagesFromDb = async (chainId: string) => {
    messageStorage.set(
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
    messageStorage.set({});
};

export const addMessage = (
    chainId: string,
    avatarId: string,
    content: string
) => {
    QueueUtils.addTask(async () => {
        const created = MsgUtils.fresh(chainId, avatarId, content);
        messageStorage.set({
            ...messageStorage.get(),
            [created.messageId]: created,
        });
        await db.chatMessages.add(created);
    });
};

export const setMessageProcessed = (messageId: string) => {
    QueueUtils.addTask(async () => {
        const s = messageStorage.get();
        const target = s[messageId];
        const update: ChatMessage = {
            ...target,
            processed: true,
        };
        messageStorage.set({
            ...s,
            [messageId]: update,
        });
        await db.chatMessages.put(update);
    });
};

export const deleteMessage = (messageId: string) => {
    QueueUtils.addTask(async () => {
        messageStorage.set(
            Object.fromEntries(
                Object.entries(messageStorage.get()).filter(
                    ([id]) => id !== messageId
                )
            )
        );
        await db.chatMessages.delete(messageId);
    });
};
