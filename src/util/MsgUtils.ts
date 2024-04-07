import { v4 as uuidv4 } from "uuid";
import { ChatMessage } from "../db";

export class MsgUtils {
    public static fresh(
        chainId: string,
        avatarId: string,
        content: string
    ): ChatMessage {
        return {
            messageId: uuidv4(),
            created: Date.now(),
            chainId,
            avatarId,
            content,
        };
    }
}