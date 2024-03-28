import { ClassicPreset } from "rete";

export class NumberSocket extends ClassicPreset.Socket {
    public wireColor = "#52c41a";

    constructor(name = NumberSocket.name) {
        super(name);
    }

    isCompatibleWith(socket: ClassicPreset.Socket) {
        return socket instanceof NumberSocket;
    }
}
