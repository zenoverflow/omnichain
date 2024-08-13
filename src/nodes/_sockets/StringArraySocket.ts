import { ClassicPreset } from "rete";

export class StringArraySocket extends ClassicPreset.Socket {
    public wireColor = "#2f54eb";

    constructor(name = StringArraySocket.name) {
        super(name);
    }

    isCompatibleWith(socket: ClassicPreset.Socket) {
        return socket instanceof StringArraySocket;
    }
}
