import Dexie, { Table } from "dexie";

export type SerializedNode = {
    nodeType: string;
    nodeId: string;
    controls: Record<string, any>;
    positionX: number;
    positionY: number;
};

export type SerializedGraph = {
    name: string;
    graphId: string;
    nodes: SerializedNode[];
    connections: any[];
    modules: Record<string, SerializedGraph>;
    zoom: number;
    areaX: number;
    areaY: number;
    created: number;
};

export type ChatMessage = {
    messageId: string;
    avatarId: string;
    content: string;
    created: number;
};

export type ChatAvatar = {
    avatarId: string;
    name: string;
    imageBase64: string;
};

class _DB extends Dexie {
    chains!: Table<SerializedGraph>;
    chatMessages!: Table<ChatMessage>;
    chatAvatars!: Table<ChatAvatar>;

    constructor() {
        super("__db__");
        this.version(1).stores({
            chains: "graphId, name",
            chatMessages: "messageId, avatarId",
            chatAvatars: "avatarId, name",
        });
    }
}

export const db = new _DB();
