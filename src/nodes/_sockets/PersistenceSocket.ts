import { ClassicPreset } from "rete";

export class PersistenceSocket extends ClassicPreset.Socket {
    public wireColor = "#eb2f96";

    constructor(name = PersistenceSocket.name) {
        super(name);
    }

    isCompatibleWith(socket: ClassicPreset.Socket) {
        return socket instanceof PersistenceSocket;
    }
}
