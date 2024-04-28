import { v4 as uuidv4 } from "uuid";
import type { ChatMessage } from "../data/types";

export const MsgUtils = {
    freshFromUser(
        chainId: string,
        content: string,
        from?: string | null,
        attachments: string[] = []
    ): ChatMessage {
        return {
            messageId: uuidv4(),
            created: Date.now(),
            chainId,
            from,
            content,
            role: "user",
            attachments,
        };
    },

    freshFromAssistant(
        chainId: string,
        content: string,
        from?: string | null,
        attachments: string[] = []
    ): ChatMessage {
        return {
            messageId: uuidv4(),
            created: Date.now(),
            chainId,
            from,
            content,
            role: "assistant",
            attachments,
        };
    },
};
