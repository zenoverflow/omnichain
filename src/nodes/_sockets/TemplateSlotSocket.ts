import { ClassicPreset } from "rete";

export class TemplateSlotSocket extends ClassicPreset.Socket {
    public wireColor = "#13c2c2";

    constructor(name = TemplateSlotSocket.name) {
        super(name);
    }

    isCompatibleWith(socket: ClassicPreset.Socket) {
        return socket instanceof TemplateSlotSocket;
    }
}
