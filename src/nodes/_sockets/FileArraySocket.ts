import { ClassicPreset } from "rete";

export class FileArraySocket extends ClassicPreset.Socket {
    public wireColor = "#faad14";

    constructor(name = FileArraySocket.name) {
        super(name);
    }

    isCompatibleWith(socket: ClassicPreset.Socket) {
        return socket instanceof FileArraySocket;
    }
}
