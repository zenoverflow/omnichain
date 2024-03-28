import { ClassicPreset } from "rete";

export class VectorQuerySocket extends ClassicPreset.Socket {
    public wireColor = "#fafafa";

    constructor(name = VectorQuerySocket.name) {
        super(name);
    }

    isCompatibleWith(socket: ClassicPreset.Socket) {
        return socket instanceof VectorQuerySocket;
    }
}
