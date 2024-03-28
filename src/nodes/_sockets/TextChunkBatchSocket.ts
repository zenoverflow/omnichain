import { ClassicPreset } from "rete";

export class TextChunkBatchSocket extends ClassicPreset.Socket {
    public wireColor = "#1677ff";

    constructor(name = TextChunkBatchSocket.name) {
        super(name);
    }

    isCompatibleWith(socket: ClassicPreset.Socket) {
        return socket instanceof TextChunkBatchSocket;
    }
}
