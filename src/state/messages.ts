import { StatefulObservable } from "../util/ObservableUtils";
import { MsgUtils } from "../util/MsgUtils";
import { QueueUtils } from "../util/QueueUtils";
import { BackendResourceUtils } from "../util/BackendResourceUtils";
import { ChatMessage } from "../data/types";

export const messageStorage = new StatefulObservable<
    Record<string, ChatMessage>
>({});

export const loadMessages = async (chainId: string) => {
    messageStorage.set(
        await BackendResourceUtils.getMultiSingle("chatMessages", chainId)
    );
};

const backendSetMessages = async (
    chainId: string,
    data: Record<string, any>
) => {
    await BackendResourceUtils.setMultiSingle("chatMessages", chainId, data);
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
        await backendSetMessages(chainId, messageStorage.get());
    });
};

export const setMessageProcessed = (chainId: string, messageId: string) => {
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
        await backendSetMessages(chainId, messageStorage.get());
    });
};

export const deleteMessage = (chainId: string, messageId: string) => {
    QueueUtils.addTask(async () => {
        messageStorage.set(
            Object.fromEntries(
                Object.entries(messageStorage.get()).filter(
                    ([id]) => id !== messageId
                )
            )
        );
        await backendSetMessages(chainId, messageStorage.get());
    });
};
