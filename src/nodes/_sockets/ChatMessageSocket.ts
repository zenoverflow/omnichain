import { ClassicPreset } from "rete";

export class ChatMessageSocket extends ClassicPreset.Socket {
    public wireColor = "#d3adf7";

    constructor(name = ChatMessageSocket.name) {
        super(name);
    }

    isCompatibleWith(socket: ClassicPreset.Socket) {
        return socket instanceof ChatMessageSocket;
    }
}
