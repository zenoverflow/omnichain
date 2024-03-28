import { ClassicPreset } from "rete";

export class StringSocket extends ClassicPreset.Socket {
    public wireColor = "#52c41a";

    constructor(name = StringSocket.name) {
        super(name);
    }

    isCompatibleWith(socket: ClassicPreset.Socket) {
        return socket instanceof StringSocket;
    }
}
