import Dexie, { Table } from "dexie";
import { SerializedGraph, ChatMessage, ChatAvatar, ApiKey } from "./data";

class _DB extends Dexie {
    chains!: Table<SerializedGraph>;
    chatMessages!: Table<ChatMessage>;
    chatAvatars!: Table<ChatAvatar>;
    apiKeys!: Table<ApiKey>;

    constructor() {
        super("__db__");
        this.version(1).stores({
            chains: "graphId, name",
            chatMessages: "messageId, chainId, avatarId",
            chatAvatars: "avatarId, name",
            apiKeys: "apiKeyId, name",
        });
    }
}

export const db = new _DB();
