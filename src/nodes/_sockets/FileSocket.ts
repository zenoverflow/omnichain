import { ClassicPreset } from "rete";

export class FileSocket extends ClassicPreset.Socket {
    public wireColor = "#fadb14";

    constructor(name = FileSocket.name) {
        super(name);
    }

    isCompatibleWith(socket: ClassicPreset.Socket) {
        return socket instanceof FileSocket;
    }
}
