import { ClassicPreset } from "rete";
import { TriggerSocket } from "./TriggerSocket";

export class GeneralDataSocket extends ClassicPreset.Socket {
    public wireColor = "#f0f5ff";

    constructor(name = GeneralDataSocket.name) {
        super(name);
    }

    isCompatibleWith(socket: ClassicPreset.Socket) {
        return !(socket instanceof TriggerSocket);
    }
}
