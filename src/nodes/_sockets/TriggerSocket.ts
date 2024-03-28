import { ClassicPreset } from "rete";

export class TriggerSocket extends ClassicPreset.Socket {
    public wireColor = "#f5222d";

    constructor(name = TriggerSocket.name) {
        super(name);
    }

    isCompatibleWith(socket: ClassicPreset.Socket) {
        return socket instanceof TriggerSocket;
    }
}
