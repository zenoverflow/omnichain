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
    avatarId: string;
    content: string;
    created: number;
    processed: boolean;
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
