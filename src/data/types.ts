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
    images: string[];
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
    /** ID of the graph (chain) the executor is running. */
    graphId: string;

    /** Messages for the frontend chat. Does not concern the API. */
    sessionMessages: ChatMessage[];

    /** Block the frontend chat. Does not affect the API. */
    chatBlocked?: boolean;

    /** Timestamp of when the executor started. */
    startTs?: number | null;

    /** The current step the executor is on. */
    step?: string | null;
};

export type ResourceIndex = Record<string, { name: string; created: number }>;
