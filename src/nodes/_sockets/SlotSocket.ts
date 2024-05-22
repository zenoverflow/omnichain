import { ClassicPreset } from "rete";

export class SlotSocket extends ClassicPreset.Socket {
    public wireColor = "#13c2c2";

    constructor(name = SlotSocket.name) {
        super(name);
    }

    isCompatibleWith(socket: ClassicPreset.Socket) {
        return socket instanceof SlotSocket;
    }
}
