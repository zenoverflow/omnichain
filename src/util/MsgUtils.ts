import { v4 as uuidv4 } from "uuid";
import type { ChatMessage } from "../data/types";

export const MsgUtils = {
    fresh(chainId: string, avatarId: string, content: string): ChatMessage {
        return {
            messageId: uuidv4(),
            created: Date.now(),
            processed: false,
            chainId,
            avatarId,
            content,
        };
    },
};
