import { ClassicPreset } from "rete";

export class VectorBatchSocket extends ClassicPreset.Socket {
    public wireColor = "#d3adf7";

    constructor(name = VectorBatchSocket.name) {
        super(name);
    }

    isCompatibleWith(socket: ClassicPreset.Socket) {
        return socket instanceof VectorBatchSocket;
    }
}
