import { ClassicPreset } from "rete";

export class ChatMessageArraySocket extends ClassicPreset.Socket {
    public wireColor = "#722ed1";

    constructor(name = ChatMessageArraySocket.name) {
        super(name);
    }

    isCompatibleWith(socket: ClassicPreset.Socket) {
        return socket instanceof ChatMessageArraySocket;
    }
}
