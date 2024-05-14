import { v4 as uuidv4 } from "uuid";

import type { ChatMessage } from "../data/types";

export const MsgUtils = {
    freshFromUser(
        chainId: string,
        content: string,
        from?: string | null,
        files: ChatMessage["files"] = []
    ): ChatMessage {
        return {
            messageId: uuidv4(),
            created: Date.now(),
            chainId,
            from,
            content,
            role: "user",
            files,
        };
    },

    freshFromAssistant(
        chainId: string,
        content: string,
        from?: string | null,
        files: ChatMessage["files"] = []
    ): ChatMessage {
        return {
            messageId: uuidv4(),
            created: Date.now(),
            chainId,
            from,
            content,
            role: "assistant",
            files,
        };
    },
};
