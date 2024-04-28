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
    zoom: number;
    areaX: number;
    areaY: number;
    created: number;
};

export type ChatMessage = {
    messageId: string;
    chainId: string;
    from?: string | null;
    role: "user" | "assistant";
    content: string;
    created: number;
    attachments: string[];
    // processed: boolean;
};

export type ChatAvatar = {
    avatarId: string;
    name: string;
    imageBase64: string;
    created: number;
};

export type ApiKey = {
    apiKeyId: string;
    name: string;
    content: string;
    created: number;
};

export type ExecutorInstance = {
    graphId: string;
    sessionMessages: ChatMessage[];
    startTs?: number | null;
    step?: string | null;
};

export type ResourceIndex = Record<string, { name: string; created: number }>;
